"use client";

import {
  Check,
  ChevronLeft,
  Clock,
  Lock,
  FileText,
  MapPin,
  Navigation,
  NotebookPen,
  RotateCcw,
  Sparkle,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Route } from "@/lib/types";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { durationMin, fmtDuration, fmtRange, itemDateLabel } from "@/lib/time";
import { AddPhotoButton, AttachmentButton, MemorySheet, PhotoViewer } from "../shared";
import { CategoryIcon, StatusChip, cn } from "../ui";
import { Sparkles } from "../Sparkles";
import { PlaceImage } from "../PlaceImage";

export function PlaceDetail({
  id,
  go,
  onBack,
}: {
  id: string;
  go: (r: Route) => void;
  onBack: () => void;
}) {
  const sched = useSchedule(30000);
  const item = sched.items.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="px-5 pt-10">
        <button className="btn btn-soft" onClick={onBack}>
          <ChevronLeft size={16} /> Voltar
        </button>
      </div>
    );
  }

  if (item.locked) return <LockedSecret item={item} go={go} onBack={onBack} />;

  return <OpenedPlace id={id} go={go} onBack={onBack} />;
}

/* ————— lugar aberto ————— */

function OpenedPlace({
  id,
  go,
  onBack,
}: {
  id: string;
  go: (r: Route) => void;
  onBack: () => void;
}) {
  const { state, toggleComplete, setNote, removePhoto, removeMemory, removeAttachment, pushToast } = useApp();
  const sched = useSchedule(30000);
  const item = sched.items.find((i) => i.id === id);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [viewer, setViewer] = useState<string | null>(null);
  const [note, setNoteLocal] = useState<string>(state.notes[id] ?? "");

  if (!item) return null;

  const done = sched.completedSet.has(item.id);
  const status = sched.statusOf(item);
  const adj = sched.adjusted(item);
  const photos = state.photos.filter((p) => p.itemId === id);
  const memories = state.memories.filter((m) => m.itemId === id);
  const attachments = state.attachments.filter((a) => a.itemId === id);

  const openRoute = () => {
    if (!item.mapQuery) {
      pushToast("Rota indisponível", "Configure o endereço nas configurações.");
      return;
    }
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.mapQuery)}`,
      "_blank"
    );
  };

  return (
    <div className="pb-32">
      {/* hero */}
      <div className="relative">
        {item.image || item.wikiTitle || item.imageSearch ? (
          <div className="relative h-60 overflow-hidden">
            <PlaceImage
              fallback={item.image}
              wikiTitle={item.wikiTitle}
              search={item.imageSearch}
              alt={item.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07060c] via-[#07060c]/25 to-[#07060c]/45" />
          </div>
        ) : (
          <div className="h-28 bg-gradient-to-b from-[#171029] to-transparent" />
        )}
        <div className="absolute top-0 right-0 left-0 flex items-center justify-between px-4 pt-5">
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="glass grid h-10 w-10 place-items-center rounded-full text-white transition active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <StatusChip status={status} />
        </div>
        <div className={cn("absolute right-5 -bottom-1 left-5", !item.image && "relative mt-2")}>
          <span className="chip chip-violet mb-2">
            <CategoryIcon category={item.category} size={11} />
            {itemDateLabel(item)}
          </span>
          <h1 className="font-display text-[26px] leading-tight font-bold tracking-tight">
            {item.title}
          </h1>
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* horário */}
        <div className="card animate-fade-up flex items-center gap-4 p-4" style={{ "--d": "40ms" } as React.CSSProperties}>
          <div className="glass grid h-11 w-11 flex-none place-items-center rounded-2xl text-[#c4b5fd]">
            <Clock size={17} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold tabular-nums">{fmtRange(item)}</p>
            <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">
              {durationMin(item) > 0 ? `duração de ${fmtDuration(durationMin(item))}` : "horário marcado"}
            </p>
            {adj && (
              <p className="mt-1 text-[11.5px] font-semibold text-[#c4b5fd]">
                ajustado para {adj.start}
                {adj.end ? ` — ${adj.end}` : ""} (+{state.delay} min)
              </p>
            )}
          </div>
        </div>

        {item.description && (
          <p className="animate-fade-up mt-5 text-[14px] leading-relaxed text-[#c9c4e0]" style={{ "--d": "80ms" } as React.CSSProperties}>
            {item.description}
          </p>
        )}

        {item.tips && item.tips.length > 0 && (
          <div className="animate-fade-up mt-5 space-y-2" style={{ "--d": "120ms" } as React.CSSProperties}>
            {item.tips.map((tip) => (
              <div key={tip} className="flex items-center gap-2.5 text-[13px] text-[#b3add6]">
                <Sparkle size={12} className="flex-none text-[#8b5cf6]" />
                {tip}
              </div>
            ))}
          </div>
        )}

        {item.address && (
          <div className="animate-fade-up mt-5 flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[#b3add6]" style={{ "--d": "160ms" } as React.CSSProperties}>
            <MapPin size={14} className="mt-0.5 flex-none text-[#c4b5fd]" />
            {item.address}
          </div>
        )}

        {/* ações */}
        <div className="animate-fade-up mt-7 grid grid-cols-2 gap-2.5" style={{ "--d": "200ms" } as React.CSSProperties}>
          <button className="btn btn-soft" onClick={openRoute}>
            <Navigation size={15} />
            Abrir rota
          </button>
          <button
            className={cn("btn", done ? "btn-soft" : "btn-primary")}
            onClick={() => {
              toggleComplete(id);
              pushToast(done ? "Marcado como pendente" : "Momento concluído", item.title);
            }}
          >
            {done ? <RotateCcw size={15} /> : <Check size={15} />}
            {done ? "Desfazer" : "Concluído"}
          </button>
          <AddPhotoButton itemId={id} className="btn-soft" />
          <button className="btn btn-soft" onClick={() => setMemoryOpen(true)}>
            <NotebookPen size={15} />
            Adicionar memória
          </button>
        </div>
        <div className="animate-fade-up mt-2.5" style={{ "--d": "220ms" } as React.CSSProperties}>
          <AttachmentButton itemId={id} />
        </div>

        {/* anotação */}
        <div className="animate-fade-up mt-7" style={{ "--d": "240ms" } as React.CSSProperties}>
          <p className="label">Anotação nossa</p>
          <textarea
            className="input min-h-[90px] resize-none"
            placeholder="Essa foi uma das minhas partes favoritas do dia."
            value={note}
            onChange={(e) => setNoteLocal(e.target.value)}
            onBlur={() => setNote(id, note)}
          />
        </div>

        {/* ingressos e reservas */}
        {attachments.length > 0 && (
          <div className="animate-fade-up mt-7" style={{ "--d": "270ms" } as React.CSSProperties}>
            <p className="label">Ingressos e reservas</p>
            <div className="space-y-2">
              {attachments.map((a) => (
                <div key={a.id} className="card flex items-center gap-3 p-3 !rounded-2xl">
                  <a href={a.src} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3">
                    {a.src.startsWith("data:image/") ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={a.src} alt="" className="h-11 w-11 flex-none rounded-xl object-cover" />
                    ) : (
                      <span className="glass grid h-11 w-11 flex-none place-items-center rounded-xl text-[#c4b5fd]"><FileText size={17} /></span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-semibold">{a.name}</span>
                      <span className="mt-0.5 block text-[10.5px] text-[#a6a0cc]">{a.kind === "ticket" ? "ingresso" : a.kind === "reservation" ? "reserva" : "documento"} · salvo offline</span>
                    </span>
                  </a>
                  <button className="text-[#8882ad] hover:text-rose-300" aria-label="Remover anexo" onClick={() => removeAttachment(a.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* fotos */}
        <div className="animate-fade-up mt-7" style={{ "--d": "280ms" } as React.CSSProperties}>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="label !mb-0">Fotos desse lugar</p>
            {photos.length > 0 && (
              <span className="text-[11.5px] font-semibold text-[#c4b5fd]">
                {photos.length} {photos.length === 1 ? "foto" : "fotos"}
              </span>
            )}
          </div>
          {photos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/12 px-4 py-6 text-center text-[12px] text-[#a6a0cc]">
              As fotos que vocês tirarem aqui aparecem neste espaço.
            </div>
          ) : (
            <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5">
              {photos.map((p) => (
                <button
                  key={p.id}
                  className="h-28 w-24 flex-none overflow-hidden rounded-2xl transition active:scale-95"
                  onClick={() => setViewer(p.src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* memórias */}
        <div className="animate-fade-up mt-7" style={{ "--d": "320ms" } as React.CSSProperties}>
          <p className="label">Memórias</p>
          {memories.length === 0 ? (
            <p className="text-[12.5px] text-[#a6a0cc]">
              Nenhuma ainda — depois do passeio, volte aqui e guarde como foi.
            </p>
          ) : (
            <div className="space-y-3">
              {memories.map((m) => (
                <div key={m.id} className="card group p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13.5px] leading-relaxed text-[#e9e4ff]">{m.text}</p>
                    <button
                      aria-label="Apagar memória"
                      className="text-[#8882ad] transition hover:text-rose-300"
                      onClick={() => removeMemory(m.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-[#a6a0cc]">
                    {m.favorite && (
                      <span className="chip chip-violet !py-1">
                        <Star size={10} /> {m.favorite}
                      </span>
                    )}
                    <span>
                      {new Date(m.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MemorySheet
        open={memoryOpen}
        onClose={() => setMemoryOpen(false)}
        itemId={id}
        placeTitle={item.title}
      />
      <PhotoViewer
        src={viewer}
        onClose={() => setViewer(null)}
        onDelete={
          viewer
            ? () => {
                const p = photos.find((x) => x.src === viewer);
                if (p) removePhoto(p.id);
                setViewer(null);
              }
            : undefined
        }
      />
    </div>
  );
}

/* ————— destino secreto bloqueado ————— */

function LockedSecret({
  item,
  go,
  onBack,
}: {
  item: { id: string; start: string; end?: string };
  go: (r: Route) => void;
  onBack: () => void;
}) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black pb-16">
      {/* atmosfera */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_45%_at_50%_0%,rgba(109,67,224,0.32),rgba(0,0,0,0)_70%)]" />
      <Sparkles count={26} />

      {/* silhueta abstrata de cidade — nada identificável */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 w-full opacity-[0.16]"
        viewBox="0 0 400 130"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 130V88h18v22h14V70h16v40h12V58h18v52h14V78h16v32h12V44h20v66h14V66h16v44h12V84h18v26h14V54h18v56h12V74h16v36h14V62h18v48h12V88h16v22h14V72h16v58H0z"
          fill="url(#skylineGrad)"
        />
        <defs>
          <linearGradient id="skylineGrad" x1="0" y1="44" x2="0" y2="130" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#1b1233" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative px-5 pt-5">
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="glass grid h-10 w-10 place-items-center rounded-full text-[#c4b5fd] transition active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="relative flex min-h-[74dvh] flex-col items-center justify-center px-8 text-center">
        <div className="animate-fade-up relative" style={{ "--d": "60ms" } as React.CSSProperties}>
          <div className="absolute inset-0 -m-8 rounded-full bg-[#7a4de8]/20 blur-3xl" />
          <div className="animate-float glass relative grid h-24 w-24 place-items-center rounded-full border-[rgba(139,92,246,0.35)] shadow-[0_0_60px_rgba(139,92,246,0.35)]">
            <Lock size={34} strokeWidth={1.6} className="text-[#c4b5fd]" />
          </div>
        </div>

        <p
          className="animate-fade-up mt-10 text-[10.5px] font-bold tracking-[0.34em] text-[#a6a0cc] uppercase"
          style={{ "--d": "140ms" } as React.CSSProperties}
        >
          Última parada
        </p>
        <h1
          className="font-display animate-fade-up mt-3 text-[31px] font-bold tracking-tight"
          style={{ "--d": "220ms" } as React.CSSProperties}
        >
          Destino secreto
        </h1>
        <p
          className="animate-fade-up mt-3 max-w-[240px] text-[13.5px] leading-relaxed text-[#b3add6]"
          style={{ "--d": "300ms" } as React.CSSProperties}
        >
          Um último lugar está esperando por você.
        </p>
        <div
          className="chip animate-fade-up mt-5"
          style={{ "--d": "380ms" } as React.CSSProperties}
        >
          <Clock size={11.5} />
          {item.start}
          {item.end ? ` — ${item.end}` : ""}
        </div>

        <button
          className="btn btn-primary animate-fade-up mt-10 !rounded-full !px-8 !py-4 text-[12.5px] font-bold tracking-[0.18em] uppercase"
          style={{ "--d": "460ms" } as React.CSSProperties}
          onClick={() => go({ name: "unlock" })}
        >
          <Lock size={15} />
          Desbloquear surpresa
        </button>
      </div>
    </div>
  );
}
