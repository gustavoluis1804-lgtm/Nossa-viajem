"use client";

import {
  ArrowRight,
  Camera,
  Check,
  Hourglass,
  Images,
  ListChecks,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Sparkle,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type { Route } from "@/lib/types";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import {
  countdownTo,
  durationMin,
  fmtBRL,
  fmtDuration,
  fmtRange,
  itemStart,
  tripPhase,
  TRIP_START,
  TRIP_END,
} from "@/lib/time";
import { IMG } from "@/data/trip";
import { phraseOfDay } from "@/data/phrases";
import { DelaySheet } from "../shared";
import { ShareTripButton, WeatherCard } from "../features";
import { ProgressBar, StatusChip, cn, stagger } from "../ui";
import { Sparkles } from "../Sparkles";

export function HomePage({ go }: { go: (r: Route) => void }) {
  const { state } = useApp();
  const sched = useSchedule(1000);
  const [delayOpen, setDelayOpen] = useState(false);

  const phase = sched.now ? tripPhase(sched.now) : null;
  const finalMode = phase === "after" || state.settings.previewFinal;
  const spent = state.expenses.reduce((acc, e) => acc + e.amount, 0);
  const remaining = Math.max(0, state.settings.budget - spent);
  const checkDone = state.checklist.filter((c) => c.done).length;

  if (finalMode) return <FinalHome go={go} />;

  return (
    <div className="px-5 pt-9 pb-32">
      {/* topo */}
      <header className="animate-fade-up">
        <p className="text-[11px] font-bold tracking-[0.34em] text-[#a6a0cc] uppercase">
          Nossa Viagem
        </p>
        <h1 className="font-display mt-3 text-[40px] leading-[1.02] font-bold tracking-tight">
          São Paulo
        </h1>
        <p className="mt-2 text-[14px] font-medium text-[#b3add6]">20–21 de outubro de 2026</p>
      </header>

      {/* contador */}
      <section
        className="card animate-fade-up relative mt-6 overflow-hidden p-6"
        style={stagger(1)}
      >
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[#7a4de8]/25 blur-[70px]" />
        <Sparkles count={10} />
        <CountdownHero />
      </section>

      {/* progresso */}
      <section className="animate-fade-up mt-6" style={stagger(2)}>
        <div className="mb-2.5 flex items-baseline justify-between">
          <p className="text-[13px] font-semibold text-[#e9e4ff]">
            {sched.doneMoments} de {sched.moments.length} momentos concluídos
          </p>
          <p className="text-[12px] font-bold text-[#c4b5fd]">
            {Math.round((sched.doneMoments / Math.max(1, sched.moments.length)) * 100)}%
          </p>
        </div>
        <ProgressBar ratio={sched.doneMoments / Math.max(1, sched.moments.length)} />
      </section>

      <WeatherCard />

      {/* próximo momento */}
      <section className="animate-fade-up mt-7" style={stagger(3)}>
        <p className="label !mb-3">Próximo momento</p>
        {sched.next ? (
          <NextMomentCard go={go} onOpenDelay={() => setDelayOpen(true)} />
        ) : (
          <div className="card relative overflow-hidden p-6 text-center">
            <Sparkles count={14} />
            <p className="font-display relative text-[17px] font-bold">Todos os momentos vividos</p>
            <p className="relative mt-1 text-[12.5px] text-[#b3add6]">
              O roteiro inteiro foi concluído. 💜
            </p>
          </div>
        )}
      </section>

      {/* atraso */}
      <section className="animate-fade-up mt-4 flex items-center gap-3" style={stagger(4)}>
        <button className="btn btn-soft flex-1" onClick={() => setDelayOpen(true)}>
          <Hourglass size={16} className="text-[#c4b5fd]" />
          Estamos atrasados
        </button>
        {state.delay > 0 && (
          <span className="chip chip-violet">+{state.delay} min aplicados</span>
        )}
      </section>

      {/* visão rápida */}
      <section className="animate-fade-up mt-7 grid grid-cols-2 gap-3" style={stagger(5)}>
        <button
          className="card p-4 text-left transition active:scale-[0.97]"
          onClick={() => go({ name: "sub", page: "gastos" })}
        >
          <div className="glass mb-3 grid h-9 w-9 place-items-center rounded-xl text-[#c4b5fd]">
            <Wallet size={16} />
          </div>
          <p className="text-[11px] font-semibold tracking-wide text-[#b3add6] uppercase">Gastos</p>
          <p className="font-display mt-1 text-[17px] font-bold">{fmtBRL(remaining)}</p>
          <p className="text-[11px] text-[#a6a0cc]">ainda disponíveis</p>
        </button>
        <button
          className="card p-4 text-left transition active:scale-[0.97]"
          onClick={() => go({ name: "sub", page: "checklist" })}
        >
          <div className="glass mb-3 grid h-9 w-9 place-items-center rounded-xl text-[#c4b5fd]">
            <ListChecks size={16} />
          </div>
          <p className="text-[11px] font-semibold tracking-wide text-[#b3add6] uppercase">
            Antes de sair
          </p>
          <p className="font-display mt-1 text-[17px] font-bold">
            {checkDone}/{state.checklist.length}
          </p>
          <p className="text-[11px] text-[#a6a0cc]">itens preparados</p>
        </button>
      </section>

      <DelaySheet open={delayOpen} onClose={() => setDelayOpen(false)} />
    </div>
  );
}

/* ————— herói do contador ————— */

function CountdownHero() {
  const sched = useSchedule(1000);
  const { now } = sched;
  if (!now) return <div className="h-24 animate-pulse-soft rounded-2xl bg-white/5" />;

  const phase = tripPhase(now);

  if (phase === "during") {
    const elapsedH = Math.floor((now.getTime() - TRIP_START.getTime()) / 3600000);
    return (
      <div className="relative">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#a6a0cc] uppercase">
          Acontecendo agora
        </p>
        <p className="font-display mt-2 text-[27px] leading-tight font-bold">
          Nossa viagem começou
        </p>
        <p className="mt-1.5 text-[13px] text-[#b3add6]">
          estamos na estrada há {elapsedH}h · cada minuto vale a pena
        </p>
      </div>
    );
  }

  if (phase === "today") {
    const left = countdownTo(now, TRIP_START);
    return (
      <div className="relative">
        <p className="font-display text-[30px] font-bold tracking-tight">É HOJE 💜</p>
        <p className="mt-1.5 text-[13px] text-[#b3add6]">a estrada começa às 22:00</p>
        <div className="mt-5 flex gap-2.5">
          <TimeBox value={left.hours} label="horas" />
          <TimeBox value={left.mins} label="min" />
          <TimeBox value={left.secs} label="seg" />
        </div>
      </div>
    );
  }

  // before
  const left = countdownTo(now, TRIP_START);
  const phrase = phraseOfDay(now);
  return (
    <div className="relative">
      <p className="text-[11px] font-bold tracking-[0.22em] text-[#a6a0cc] uppercase">
        Contagem regressiva
      </p>
      <div className="mt-2 flex items-baseline gap-2.5">
        <span className="font-display text-[52px] leading-none font-bold tracking-tight text-gradient">
          {left.days}
        </span>
        <span className="font-display text-[19px] font-semibold text-[#c4b5fd]">
          {left.days === 1 ? "dia" : "dias"}
        </span>
      </div>
      <p className="mt-1 text-[13px] font-medium text-[#b3add6]">
        {left.days === 1 ? "Falta 1 dia" : `Faltam ${left.days} dias`}
      </p>
      <div className="mt-5 flex gap-2.5">
        <TimeBox value={left.hours} label="horas" />
        <TimeBox value={left.mins} label="min" />
        <TimeBox value={left.secs} label="seg" />
      </div>
      <p className="mt-4 border-t border-white/[0.07] pt-4 text-[11.5px] leading-relaxed text-[#a6a0cc] italic">
        “{phrase}”
      </p>
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass flex-1 rounded-2xl px-3 py-2.5 text-center">
      <p className="font-display text-[19px] font-bold tabular-nums">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#a6a0cc] uppercase">
        {label}
      </p>
    </div>
  );
}

/* ————— cartão do próximo momento ————— */

function NextMomentCard({ go, onOpenDelay }: { go: (r: Route) => void; onOpenDelay: () => void }) {
  const { state, toggleComplete, pushToast } = useApp();
  const sched = useSchedule(1000);
  const item = sched.next;
  if (!item) return null;

  const locked = Boolean(item.locked);
  const done = sched.completedSet.has(item.id);
  const status = sched.statusOf(item);
  const adj = sched.adjusted(item);

  let timeHint = "";
  if (sched.minutesToNext !== null) {
    if (status === "now") timeHint = "Acontecendo agora";
    else if (sched.minutesToNext <= 0) timeHint = "Na sequência do dia";
    else if (sched.minutesToNext < 90) timeHint = `Faltam ${sched.minutesToNext} minutos`;
    else if (sched.minutesToNext < 60 * 24) {
      const h = Math.floor(sched.minutesToNext / 60);
      timeHint = `Faltam ${h}h${String(sched.minutesToNext % 60).padStart(2, "0")}`;
    } else {
      timeHint = `20 de outubro · ${item.start}`;
    }
  }

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
    <div className="card relative overflow-hidden">
      {item.image && !locked && (
        <div className="relative h-32 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0814] via-[#0b0814]/35 to-transparent" />
        </div>
      )}
      {locked && (
        <div className="relative h-24 overflow-hidden bg-gradient-to-b from-[#1b1233] to-[#0b0814]">
          <Sparkles count={12} />
        </div>
      )}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <StatusChip status={status} />
            <h3 className="font-display mt-2.5 truncate text-[20px] font-bold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-1 text-[13px] font-medium text-[#b3add6]">
              {fmtRange(item)}
              {adj && (
                <span className="text-[#c4b5fd]">
                  {"  "}→ ajustado {adj.start}
                  {adj.end ? ` — ${adj.end}` : ""}
                </span>
              )}
            </p>
            <p className="mt-1 text-[12px] text-[#a6a0cc]">
              {durationMin(item) > 0 && `${fmtDuration(durationMin(item))} · `}
              {timeHint}
            </p>
          </div>
          <div className="glass grid h-11 w-11 flex-none place-items-center rounded-2xl text-[#c4b5fd]">
            <MapPin size={18} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button className="btn btn-soft !px-3" onClick={() => go({ name: "place", id: item.id })}>
            Ver detalhes
            <ArrowRight size={15} />
          </button>
          {locked ? (
            <button
              className="btn btn-primary !px-3"
              onClick={() => go({ name: "unlock" })}
            >
              Desbloquear
            </button>
          ) : (
            <button className="btn btn-soft !px-3" onClick={openRoute}>
              <Navigation size={15} />
              Abrir rota
            </button>
          )}
        </div>
        {!locked && (
          <button
            className={cn("btn mt-2.5 w-full", done ? "btn-soft" : "btn-primary")}
            onClick={() => {
              toggleComplete(item.id);
              pushToast(done ? "Marcado como pendente" : "Momento concluído", item.title);
            }}
          >
            <Check size={15} />
            {done ? "Desfazer conclusão" : "Marcar como concluído"}
          </button>
        )}
        {(status === "now" || status === "next") && (
          <button
            className="mt-3 w-full text-center text-[11.5px] font-medium text-[#a6a0cc] underline-offset-2 hover:underline"
            onClick={onOpenDelay}
          >
            Estamos atrasados?
          </button>
        )}
      </div>
    </div>
  );
}

/* ————— home final (depois da viagem) ————— */

function FinalHome({ go }: { go: (r: Route) => void }) {
  const { state, updateSettings } = useApp();
  const sched = useSchedule(60000);
  const spent = state.expenses.reduce((acc, e) => acc + e.amount, 0);
  const hours = Math.round((TRIP_END.getTime() - TRIP_START.getTime()) / 3600000);

  return (
    <div className="px-5 pt-9 pb-32">
      <header className="animate-fade-up">
        <p className="text-[11px] font-bold tracking-[0.34em] text-[#a6a0cc] uppercase">
          20–21 outubro de 2026
        </p>
        <h1 className="font-display mt-3 text-[36px] leading-[1.05] font-bold tracking-tight">
          Nossa viagem 💜
        </h1>
        <p className="mt-2 text-[14px] font-medium text-[#b3add6]">São Paulo</p>
      </header>

      <section
        className="card animate-fade-up relative mt-6 h-44 overflow-hidden"
        style={stagger(1)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMG.skylineSunset}
          alt="São Paulo"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07060c] via-transparent to-transparent" />
        <p className="absolute bottom-4 left-5 text-[13px] font-semibold text-white/90">
          Uma viagem para guardar.
        </p>
      </section>

      <section className="animate-fade-up mt-6 grid grid-cols-2 gap-3" style={stagger(2)}>
        <StatCard
          icon={<RouteIcon size={16} />}
          label="Lugares visitados"
          value={`${sched.doneMoments} de ${sched.moments.length}`}
        />
        <StatCard
          icon={<Images size={16} />}
          label="Fotos"
          value={String(state.photos.length)}
        />
        <StatCard
          icon={<Camera size={16} />}
          label="Memórias"
          value={String(state.memories.length)}
        />
        <StatCard icon={<Wallet size={16} />} label="Investido" value={fmtBRL(spent)} />
      </section>

      <section
        className="card animate-fade-up mt-3 flex items-center justify-between p-4"
        style={stagger(3)}
      >
        <p className="text-[12.5px] font-medium text-[#b3add6]">Duração da viagem</p>
        <p className="font-display text-[16px] font-bold">{hours} horas juntos</p>
      </section>

      <button
        className="btn btn-primary animate-fade-up mt-6 w-full !py-4 text-[15px]"
        style={stagger(4)}
        onClick={() => go({ name: "recap" })}
      >
        <Sparkle size={17} />
        Relembrar nossa viagem
      </button>
      <div className="animate-fade-up mt-3" style={stagger(5)}>
        <ShareTripButton />
      </div>

      {state.settings.previewFinal && (
        <button
          className="animate-fade-up mt-3 w-full text-center text-[11.5px] text-[#a6a0cc] underline underline-offset-2"
          style={stagger(5)}
          onClick={() => updateSettings({ previewFinal: false })}
        >
          Voltar à tela normal (prévia ativa)
        </button>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-4">
      <div className="glass mb-3 grid h-9 w-9 place-items-center rounded-xl text-[#c4b5fd]">
        {icon}
      </div>
      <p className="font-display text-[19px] font-bold">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium tracking-wide text-[#a6a0cc] uppercase">
        {label}
      </p>
    </div>
  );
}
