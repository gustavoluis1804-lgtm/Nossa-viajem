"use client";

import { ExternalLink, Lock, MapPin, Navigation, Route as RouteIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { fmtRange } from "@/lib/time";
import type { TripItem } from "@/lib/types";
import { PageHeader, cn, stagger } from "../ui";
import { PlaceImage } from "../PlaceImage";

export function MapaPage() {
  const { state, pushToast } = useApp();
  const sched = useSchedule(60000);

  // paradas navegáveis: têm mapa — a surpresa bloqueada aparece como mistério
  const stops = useMemo(
    () => sched.items.filter((i) => i.mapQuery || i.locked),
    [sched.items]
  );
  const openStops = stops.filter((s) => !s.locked);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = openStops.find((s) => s.id === selectedId) ?? openStops[0];

  const origin = state.settings.lodgingAddress || `${state.settings.originCity}, SP`;

  const fullRouteUrl = () => {
    if (openStops.length === 0) return null;
    const dest = openStops[openStops.length - 1].mapQuery as string;
    const wp = openStops
      .slice(0, -1)
      .map((s) => s.mapQuery as string)
      .join("|");
    const base = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`;
    return wp ? `${base}&waypoints=${encodeURIComponent(wp)}` : base;
  };

  const routeOf = (item: TripItem) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.mapQuery ?? "")}`;

  return (
    <div className="pb-32">
      <PageHeader
        title="Mapa da viagem"
        subtitle={`${openStops.length} paradas · na ordem do roteiro`}
        right={
          <button
            className="btn btn-primary !rounded-full !px-4 !py-2.5 text-[12.5px]"
            onClick={() => {
              const url = fullRouteUrl();
              if (url) window.open(url, "_blank");
              else pushToast("Rota indisponível", "Configure os endereços nas configurações.");
            }}
          >
            <RouteIcon size={14} />
            Rota completa
          </button>
        }
      />

      {/* mapa da parada selecionada */}
      {selected && (
        <div className="animate-fade-up px-5" style={stagger(1)}>
          <div className="card overflow-hidden">
            <iframe
              key={selected.id}
              title={`Mapa de ${selected.title}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(selected.mapQuery ?? "")}&z=15&output=embed`}
              className="h-52 w-full border-0"
              loading="lazy"
            />
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold">{selected.title}</p>
                <p className="truncate text-[11.5px] text-[#a6a0cc]">{selected.address}</p>
              </div>
              <button
                className="btn btn-soft flex-none !rounded-full !px-3.5 !py-2 text-[12px]"
                onClick={() => window.open(routeOf(selected), "_blank")}
              >
                <ExternalLink size={13} />
                Google Maps
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10.5px] text-[#8882ad]">
            o mapa precisa de internet · o roteiro funciona offline
          </p>
        </div>
      )}

      {/* lista de paradas */}
      <div className="mt-6 space-y-2.5 px-5">
        {stops.map((item, i) => {
          if (item.locked) {
            return (
              <div
                key={item.id}
                className="card animate-fade-up flex items-center gap-3.5 !border-dashed p-4 opacity-80"
                style={stagger(i + 2, 40)}
              >
                <div className="glass grid h-10 w-10 flex-none place-items-center rounded-2xl text-[#a6a0cc]">
                  <Lock size={15} />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-[#b3add6]">Parada secreta</p>
                  <p className="text-[11.5px] text-[#8882ad]">
                    desbloqueie a surpresa para revelar o lugar
                  </p>
                </div>
              </div>
            );
          }

          const active = selected?.id === item.id;
          const numero = openStops.indexOf(item) + 1;
          return (
            <button
              key={item.id}
              className={cn(
                "card animate-fade-up flex w-full items-center gap-3.5 p-3 text-left transition active:scale-[0.98]",
                active && "border-[rgba(139,92,246,0.45)] shadow-[0_0_30px_rgba(139,92,246,0.15)]"
              )}
              style={stagger(i + 2, 40)}
              onClick={() => setSelectedId(item.id)}
            >
              {item.image || item.wikiTitle || item.imageSearch ? (
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-2xl">
                  <PlaceImage
                    fallback={item.image}
                    wikiTitle={item.wikiTitle}
                    search={item.imageSearch}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="font-display absolute top-1 left-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-[10.5px] font-bold text-[#c4b5fd]">
                    {numero}
                  </span>
                </div>
              ) : (
                <div className="glass relative grid h-14 w-14 flex-none place-items-center rounded-2xl text-[#c4b5fd]">
                  <MapPin size={18} />
                  <span className="font-display absolute top-1 left-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-[10.5px] font-bold text-[#c4b5fd]">
                    {numero}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold">{item.title}</p>
                <p className="mt-0.5 text-[11.5px] text-[#a6a0cc] tabular-nums">{fmtRange(item)}</p>
                {item.address && (
                  <p className="mt-0.5 truncate text-[11px] text-[#8882ad]">{item.address}</p>
                )}
              </div>
              <span
                role="button"
                tabIndex={0}
                aria-label={`Rota para ${item.title}`}
                className="btn btn-soft flex-none !rounded-full !p-2.5"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(routeOf(item), "_blank");
                }}
              >
                <Navigation size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
