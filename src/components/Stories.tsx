"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { fmtBRL, fmtRange } from "@/lib/time";
import { ShareTripButton } from "./features";
import { Sparkles } from "./Sparkles";

interface Story {
  id: string;
  kind: "intro" | "place" | "final";
  title: string;
  subtitle?: string;
  image?: string;
  memory?: string;
}

export function Stories({ onBack }: { onBack: () => void }) {
  const { state } = useApp();
  const sched = useSchedule(60000);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const stories = useMemo<Story[]>(() => {
    const placeStories = sched.moments
      .filter((m) => !m.locked)
      .map((m) => {
        const photos = state.photos.filter((p) => p.itemId === m.id);
        const memories = state.memories.filter((x) => x.itemId === m.id);
        return {
          id: m.id,
          kind: "place" as const,
          title: m.title,
          subtitle: fmtRange(m),
          image: photos[photos.length - 1]?.src ?? m.image,
          memory: memories[0]?.text ?? state.notes[m.id],
        };
      });
    return [
      {
        id: "intro",
        kind: "intro" as const,
        title: "Nossa viagem",
        subtitle: "São Paulo · 20–21 de outubro de 2026",
        image: state.couplePhoto ?? state.photos[state.photos.length - 1]?.src,
      },
      ...placeStories,
      {
        id: "final",
        kind: "final" as const,
        title: "Uma viagem para guardar.",
        subtitle: "e essa é só a primeira de muitas.",
      },
    ];
  }, [sched.moments, state]);

  useEffect(() => {
    setProgress(0);
    if (stories[index]?.kind === "final") return;
    const started = Date.now();
    const duration = 6000;
    const timer = setInterval(() => {
      const next = Math.min(1, (Date.now() - started) / duration);
      setProgress(next);
      if (next >= 1) {
        clearInterval(timer);
        setIndex((i) => Math.min(stories.length - 1, i + 1));
      }
    }, 50);
    return () => clearInterval(timer);
  }, [index, stories]);

  const story = stories[index];
  const next = () => setIndex((i) => Math.min(stories.length - 1, i + 1));
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const spent = state.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fixed inset-0 z-[85] mx-auto h-[100dvh] w-full max-w-[432px] overflow-hidden bg-black">
      {story.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img key={story.id} src={story.image} alt="" className="animate-kenburns absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(100%_65%_at_50%_20%,rgba(109,67,224,0.45),#090711_70%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/90" />
      {story.kind === "final" && <Sparkles count={30} />}

      <div className="absolute top-0 right-0 left-0 z-20 px-3 pt-[max(14px,env(safe-area-inset-top))]">
        <div className="flex gap-1.5">
          {stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-75"
                style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
              />
            </div>
          ))}
        </div>
        <button className="glass mt-4 grid h-9 w-9 place-items-center rounded-full text-white" onClick={onBack} aria-label="Fechar stories">
          <X size={17} />
        </button>
      </div>

      <button className="absolute top-20 bottom-36 left-0 z-10 w-1/2" onClick={prev} aria-label="Story anterior" />
      <button className="absolute top-20 right-0 bottom-36 z-10 w-1/2" onClick={next} aria-label="Próximo story" />

      <div className="absolute right-0 bottom-0 left-0 z-20 p-6 pb-[max(28px,env(safe-area-inset-bottom))]">
        {story.kind === "intro" && (
          <p className="mb-4 text-[10.5px] font-bold tracking-[0.32em] text-[#c4b5fd] uppercase">a nossa primeira viagem</p>
        )}
        {story.kind === "place" && (
          <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#c4b5fd] uppercase">{story.subtitle}</p>
        )}
        <h1 className="font-display text-[31px] leading-tight font-bold tracking-tight">{story.title}</h1>
        {story.kind === "intro" && <p className="mt-2 text-[13.5px] text-white/75">{story.subtitle}</p>}
        {story.memory && <p className="mt-4 max-w-[330px] text-[14px] leading-relaxed text-white/85 italic">“{story.memory}”</p>}

        {story.kind === "final" && (
          <div className="mt-5">
            <div className="mb-4 grid grid-cols-3 gap-2">
              <StoryStat value={`${sched.doneMoments}/${sched.moments.length}`} label="lugares" />
              <StoryStat value={String(state.photos.length)} label="fotos" />
              <StoryStat value={fmtBRL(spent)} label="gastos" small />
            </div>
            <ShareTripButton className="btn btn-primary w-full" />
          </div>
        )}

        {story.kind !== "final" && (
          <div className="mt-5 flex items-center justify-end gap-2 text-[11px] text-white/60">
            toque para continuar <ChevronRight size={13} />
          </div>
        )}
        {index > 0 && story.kind === "final" && (
          <button className="mx-auto mt-4 flex items-center gap-1 text-[11px] text-white/60" onClick={prev}>
            <ChevronLeft size={13} /> rever momento anterior
          </button>
        )}
      </div>
    </div>
  );
}

function StoryStat({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className={`font-display font-bold ${small ? "text-[13px]" : "text-[18px]"}`}>{value}</p>
      <p className="mt-1 text-[9.5px] font-bold tracking-wider text-white/60 uppercase">{label}</p>
    </div>
  );
}
