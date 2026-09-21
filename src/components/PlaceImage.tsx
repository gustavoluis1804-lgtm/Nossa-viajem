"use client";

import { useEffect, useMemo, useState } from "react";

interface PlaceImageProps {
  alt: string;
  className?: string;
  fallback?: string;
  wikiTitle?: string;
  search?: string;
}

const mem = new Map<string, string>();

function keyOf(wikiTitle?: string, search?: string) {
  return `nossa-viagem:place-image:${wikiTitle ?? search ?? ""}`;
}

async function wikipediaThumb(title: string): Promise<string | null> {
  const url = new URL("https://pt.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("piprop", "thumbnail");
  url.searchParams.set("pithumbsize", "1400");
  url.searchParams.set("titles", title);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const json = await res.json();
  const pages = Object.values(json?.query?.pages ?? {}) as Array<any>;
  return pages.find((p) => p?.thumbnail?.source)?.thumbnail?.source ?? null;
}

async function commonsSearch(query: string): Promise<string | null> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrlimit", "8");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime");
  url.searchParams.set("iiurlwidth", "1400");
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const json = await res.json();
  const pages = Object.values(json?.query?.pages ?? {}) as Array<any>;
  const usable = pages.find((p) => {
    const info = p?.imageinfo?.[0];
    return info?.thumburl && String(info?.mime ?? "").startsWith("image/");
  });
  return usable?.imageinfo?.[0]?.thumburl ?? null;
}

export function PlaceImage({ alt, className = "", fallback, wikiTitle, search }: PlaceImageProps) {
  const cacheKey = useMemo(() => keyOf(wikiTitle, search), [wikiTitle, search]);
  const [src, setSrc] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return fallback;
    return mem.get(cacheKey) || window.localStorage.getItem(cacheKey) || fallback;
  });

  useEffect(() => {
    if (!wikiTitle && !search) return;
    let cancelled = false;

    void (async () => {
      try {
        const exact = wikiTitle ? await wikipediaThumb(wikiTitle) : null;
        const found = exact || (search ? await commonsSearch(search) : null);
        if (!found || cancelled) return;
        mem.set(cacheKey, found);
        try {
          window.localStorage.setItem(cacheKey, found);
        } catch {
          // sem espaço de cache: a foto ainda funciona nesta sessão
        }
        setSrc(found);
      } catch {
        // mantém o fallback local/remoto configurado no roteiro
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, search, wikiTitle]);

  if (!src) {
    return <div aria-label={alt} className={`bg-gradient-to-br from-[#221741] to-[#0d0a17] ${className}`} />;
  }

  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
