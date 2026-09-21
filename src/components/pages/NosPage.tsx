"use client";

import { Camera, Heart, Images, NotebookPen, Plane } from "lucide-react";
import { useRef } from "react";
import type { Route } from "@/lib/types";
import { useApp } from "@/services/store";
import { fileToDataUrl } from "@/services/images";
import { useNow } from "@/hooks/useNow";
import { relParts } from "@/lib/time";
import { BackHeader, stagger } from "../ui";

export function NosPage({ go, onBack }: { go: (r: Route) => void; onBack: () => void }) {
  const { state, setCouplePhoto, pushToast } = useApp();
  const now = useNow(1000);
  const inputRef = useRef<HTMLInputElement>(null);

  const rel = now ? relParts(now) : null;

  return (
    <div className="pb-32">
      <BackHeader title="Nós" subtitle="a nossa história, em números" onBack={onBack} />

      {/* foto do casal */}
      <section className="animate-fade-up px-5" style={stagger(1)}>
        <button
          className="card relative block h-64 w-full overflow-hidden text-left transition active:scale-[0.99]"
          onClick={() => inputRef.current?.click()}
        >
          {state.couplePhoto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={state.couplePhoto} alt="Nós dois" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#221741] via-[#150f28] to-[#0d0a17]">
              <div className="text-center">
                <div className="glass mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full text-[#c4b5fd]">
                  <Heart size={22} strokeWidth={1.6} />
                </div>
                <p className="text-[13px] font-semibold text-[#e9e4ff]">A nossa foto vai ficar aqui</p>
                <p className="mt-1 text-[11.5px] text-[#a6a0cc]">toque para adicionar</p>
              </div>
            </div>
          )}
          <span className="glass absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full text-white">
            <Camera size={15} />
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              setCouplePhoto(await fileToDataUrl(file, 1080, 0.85));
              pushToast("Foto nossa guardada 💜");
            } catch {
              pushToast("Não consegui salvar a foto");
            }
          }}
        />
      </section>

      {/* o começo */}
      <section className="card animate-fade-up mx-5 mt-4 flex items-center justify-between p-5" style={stagger(2)}>
        <div>
          <p className="text-[10.5px] font-bold tracking-[0.22em] text-[#a6a0cc] uppercase">
            O começo de tudo
          </p>
          <p className="font-display mt-1.5 text-[19px] font-bold tabular-nums">12/09/2026</p>
        </div>
        <p className="font-display text-[15px] font-semibold text-[#c4b5fd] tabular-nums">16:43</p>
      </section>

      {/* contador do relacionamento */}
      <section className="card animate-fade-up mx-5 mt-4 p-5" style={stagger(3)}>
        <p className="label !mb-4">{rel?.future ? "Nossa história começa em" : "Juntos há"}</p>
        {rel ? (
          <div className="grid grid-cols-3 gap-2.5">
            <RelBox value={rel.days} label="dias" />
            <RelBox value={rel.hours} label="horas" />
            <RelBox value={rel.mins} label="min" />
          </div>
        ) : (
          <div className="h-20 animate-pulse-soft rounded-2xl bg-white/5" />
        )}
      </section>

      {/* números */}
      <section className="animate-fade-up mx-5 mt-4 grid grid-cols-3 gap-2.5" style={stagger(4)}>
        <MiniStat icon={<Plane size={15} />} value="1" label="viagem" />
        <MiniStat icon={<NotebookPen size={15} />} value={String(state.memories.length)} label="memórias" />
        <MiniStat icon={<Images size={15} />} value={String(state.photos.length)} label="fotos" />
      </section>

      <p
        className="animate-fade-up mt-8 px-5 text-center text-[12.5px] text-[#a6a0cc] italic"
        style={stagger(5)}
      >
        “e essa é só a primeira de muitas.”
      </p>
    </div>
  );
}

function RelBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass rounded-2xl px-3 py-4 text-center">
      <p className="font-display text-[24px] leading-none font-bold tabular-nums text-gradient">
        {value}
      </p>
      <p className="mt-1.5 text-[10px] font-bold tracking-[0.16em] text-[#a6a0cc] uppercase">
        {label}
      </p>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card flex flex-col items-center gap-1.5 p-4">
      <span className="text-[#c4b5fd]">{icon}</span>
      <p className="font-display text-[19px] leading-none font-bold">{value}</p>
      <p className="text-[10px] font-bold tracking-[0.14em] text-[#a6a0cc] uppercase">{label}</p>
    </div>
  );
}
