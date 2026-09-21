"use client";

import { Camera, Check, ChevronLeft, Clock, Heart, Images, Route as RouteIcon, Wallet } from "lucide-react";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { fmtBRL, fmtRange, TRIP_END, TRIP_START } from "@/lib/time";
import { IMG } from "@/data/trip";
import { stagger } from "./ui";
import { Sparkles } from "./Sparkles";
import { PlaceImage } from "./PlaceImage";

/** "Relembrar nossa viagem" — o álbum depois do retorno. */
export function Recap({ onBack }: { onBack: () => void }) {
  const { state } = useApp();
  const sched = useSchedule(60000);
  const spent = state.expenses.reduce((acc, e) => acc + e.amount, 0);
  const hours = Math.round((TRIP_END.getTime() - TRIP_START.getTime()) / 3600000);

  return (
    <div className="relative min-h-[100dvh] pb-16">
      <div className="relative h-64 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.skylineSunset} alt="São Paulo" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07060c] via-[#07060c]/30 to-[#07060c]/40" />
        <div className="absolute top-0 right-0 left-0 px-4 pt-5">
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="glass grid h-10 w-10 place-items-center rounded-full text-white transition active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="absolute bottom-5 left-5">
          <p className="text-[10.5px] font-bold tracking-[0.34em] text-[#c4b5fd] uppercase">
            São Paulo · 20–21 out 2026
          </p>
          <h1 className="font-display mt-2 text-[30px] leading-tight font-bold tracking-tight">
            Nossa viagem 💜
          </h1>
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="animate-fade-up grid grid-cols-2 gap-3" style={stagger(1)}>
          <Stat icon={<RouteIcon size={15} />} label="lugares" value={`${sched.doneMoments} de ${sched.moments.length}`} />
          <Stat icon={<Images size={15} />} label="fotos" value={String(state.photos.length)} />
          <Stat icon={<Camera size={15} />} label="memórias" value={String(state.memories.length)} />
          <Stat icon={<Wallet size={15} />} label="investido" value={fmtBRL(spent)} />
        </div>
        <div className="card animate-fade-up mt-3 flex items-center justify-between p-4" style={stagger(2)}>
          <span className="flex items-center gap-2 text-[12.5px] text-[#b3add6]">
            <Clock size={14} className="text-[#c4b5fd]" /> duração da viagem
          </span>
          <span className="font-display text-[15px] font-bold">{hours} horas juntos</span>
        </div>

        <p className="label animate-fade-up mt-8" style={stagger(3)}>
          Momento a momento
        </p>
        <div className="animate-fade-up space-y-2.5" style={stagger(4)}>
          {sched.moments.map((m, i) => {
            const done = sched.completedSet.has(m.id);
            const photos = state.photos.filter((p) => p.itemId === m.id);
            const cover = photos.length > 0 ? photos[photos.length - 1].src : m.image;
            return (
              <div key={m.id} className="card flex items-center gap-3.5 p-3">
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-2xl">
                  {photos.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PlaceImage
                      fallback={m.image}
                      wikiTitle={m.wikiTitle}
                      search={m.imageSearch}
                      alt={m.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {done && (
                    <span className="absolute inset-0 grid place-items-center bg-black/45">
                      <Check size={16} strokeWidth={3} className="text-[#c4b5fd]" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold">{m.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-[#a6a0cc] tabular-nums">{fmtRange(m)}</p>
                </div>
                {photos.length > 0 && (
                  <span className="chip !py-1 text-[10.5px]">{photos.length} fotos</span>
                )}
                <span className="font-display text-[12px] font-bold text-[#8882ad]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>

        <div className="card animate-fade-up relative mt-8 overflow-hidden p-7 text-center" style={stagger(5)}>
          <Sparkles count={18} />
          <Heart size={18} className="relative mx-auto text-[#c4b5fd]" fill="currentColor" />
          <p className="font-display relative mt-4 text-[17px] leading-snug font-bold">
            Nossa primeira viagem ficou para a história. 💜
          </p>
          <p className="relative mt-2 text-[12px] text-[#b3add6]">
            Sorocaba → São Paulo → Sorocaba · 26 horas que valem para sempre
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="glass grid h-9 w-9 flex-none place-items-center rounded-xl text-[#c4b5fd]">
        {icon}
      </div>
      <div>
        <p className="font-display text-[16px] leading-tight font-bold">{value}</p>
        <p className="text-[10.5px] font-semibold tracking-wide text-[#a6a0cc] uppercase">{label}</p>
      </div>
    </div>
  );
}
