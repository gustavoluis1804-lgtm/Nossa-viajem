"use client";

import { Check, Hourglass, Lock } from "lucide-react";
import { useState } from "react";
import type { Route, TripItem } from "@/lib/types";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { durationMin, fmtDuration, weekdayLabel } from "@/lib/time";
import { DelaySheet } from "../shared";
import { CategoryIcon, PageHeader, StatusChip, cn, stagger } from "../ui";
import { Sparkles } from "../Sparkles";

const GROUPS: Array<{ key: "20" | "21"; day: string; iso: string }> = [
  { key: "20", day: "20", iso: "2026-10-20" },
  { key: "21", day: "21", iso: "2026-10-21" },
];

export function RoteiroPage({ go }: { go: (r: Route) => void }) {
  const { state } = useApp();
  const sched = useSchedule(30000);
  const [delayOpen, setDelayOpen] = useState(false);

  return (
    <div className="pb-32">
      <PageHeader
        title="Nosso dia"
        subtitle="cada momento, no seu tempo"
        right={
          <div className="flex flex-col items-end gap-2">
            <button
              className="btn btn-soft !rounded-full !px-4 !py-2.5 text-[12.5px]"
              onClick={() => setDelayOpen(true)}
            >
              <Hourglass size={14} className="text-[#c4b5fd]" />
              Atrasados
            </button>
            {state.delay > 0 && <span className="chip chip-violet">+{state.delay} min</span>}
          </div>
        }
      />

      {GROUPS.map((g, gi) => {
        const list = sched.items.filter((i) => i.group === g.key);
        return (
          <section key={g.key} className="animate-fade-up px-5" style={stagger(gi + 1)}>
            <div className="mt-4 mb-1 flex items-baseline gap-3">
              <span className="font-display text-[34px] leading-none font-bold text-gradient">
                {g.day}
              </span>
              <div>
                <p className="text-[13.5px] font-semibold">outubro</p>
                <p className="text-[11.5px] text-[#a6a0cc] capitalize">{weekdayLabel(g.iso)}</p>
              </div>
            </div>

            <div className="relative mt-2">
              {/* linha da timeline */}
              <span className="absolute top-2 bottom-4 left-[72px] w-px bg-gradient-to-b from-[#8b5cf6]/40 via-white/10 to-transparent" />

              <div className="space-y-1.5">
                {list.map((item, i) => (
                  <TimelineRow
                    key={item.id}
                    item={item}
                    index={i}
                    go={go}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <DelaySheet open={delayOpen} onClose={() => setDelayOpen(false)} />
    </div>
  );
}

function TimelineRow({ item, index, go }: { item: TripItem; index: number; go: (r: Route) => void }) {
  const { toggleComplete, pushToast } = useApp();
  const sched = useSchedule(30000);
  const done = sched.completedSet.has(item.id);
  const status = sched.statusOf(item);
  const adj = sched.adjusted(item);

  if (item.locked) {
    return (
      <div className="animate-fade-up relative flex gap-0 py-1" style={stagger(index, 26)}>
        <TimeColumn start={item.start} end={item.end} adjusted={adj} dimmed={false} />
        <NodeDot category="secret" active={status === "next" || status === "now"} done={false} />
        <button
          className="card relative ml-3 flex-1 overflow-hidden p-4 text-left transition active:scale-[0.98]"
          onClick={() => go({ name: "place", id: item.id })}
        >
          <Sparkles count={8} />
          <div className="relative flex items-center gap-3.5">
            <div className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-[#9a6bff]/30 to-[#6d43e0]/10 text-[#c4b5fd] shadow-[0_0_26px_rgba(139,92,246,0.25)]">
              <Lock size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.22em] text-[#a6a0cc] uppercase">
                Última parada
              </p>
              <p className="font-display mt-0.5 text-[16px] font-bold">Destino secreto</p>
              <p className="mt-0.5 text-[11.5px] text-[#b3add6]">
                Um último lugar está esperando por você.
              </p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up relative flex gap-0 py-1" style={stagger(index, 26)}>
      <TimeColumn start={item.start} end={item.end} adjusted={adj} dimmed={done} />
      <NodeDot
        category={item.category}
        active={status === "next" || status === "now"}
        done={done}
      />
      <button
        className={cn(
          "relative ml-3 flex-1 rounded-[18px] border px-3.5 py-3 text-left transition active:scale-[0.98]",
          done
            ? "border-white/[0.05] bg-white/[0.02]"
            : status === "next" || status === "now"
              ? "card border-[rgba(139,92,246,0.35)]"
              : "card !shadow-none"
        )}
        onClick={() => go({ name: "place", id: item.id })}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <p
              className={cn(
                "text-[14px] leading-snug font-semibold",
                done ? "text-[#948eb8]" : "text-[#f4f2fb]"
              )}
            >
              {item.title}
            </p>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#a6a0cc]">
                {item.description}
              </p>
            )}
            {(item.moment || status !== "todo") && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <StatusChip status={status} />
                {durationMin(item) >= 60 && (
                  <span className="chip">{fmtDuration(durationMin(item))}</span>
                )}
              </div>
            )}
          </div>
          <span
            role="button"
            tabIndex={0}
            aria-label={done ? "Desmarcar" : "Marcar como concluído"}
            className={cn("check-toggle mt-0.5", done && "on")}
            onClick={(e) => {
              e.stopPropagation();
              toggleComplete(item.id);
              if (!done) pushToast("Momento concluído", item.title);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                toggleComplete(item.id);
              }
            }}
          >
            {done && <Check size={14} strokeWidth={3} className="animate-pop" />}
          </span>
        </div>
      </button>
    </div>
  );
}

function TimeColumn({
  start,
  end,
  adjusted,
  dimmed,
}: {
  start: string;
  end?: string;
  adjusted: { start: string; end?: string; plusOne: boolean } | null;
  dimmed: boolean;
}) {
  return (
    <div className={cn("w-[56px] flex-none pt-3 text-right", dimmed && "opacity-45")}>
      <p className="text-[13px] font-bold tabular-nums">{start}</p>
      {end && end !== start && <p className="mt-0.5 text-[10.5px] text-[#a6a0cc] tabular-nums">{end}</p>}
      {adjusted && (
        <p className="mt-1 text-[10.5px] leading-tight font-bold text-[#c4b5fd] tabular-nums">
          ↓ {adjusted.start}
          {adjusted.plusOne ? " ⁺¹" : ""}
        </p>
      )}
    </div>
  );
}

function NodeDot({
  category,
  active,
  done,
}: {
  category: TripItem["category"];
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="relative z-10 mr-0 ml-[4px] flex w-8 flex-none justify-center">
      <div
        className={cn(
          "mt-3 grid h-8 w-8 place-items-center rounded-full border transition-all duration-300",
          done
            ? "border-transparent bg-[#3d2a75] text-[#c4b5fd]"
            : active
              ? "border-transparent bg-gradient-to-br from-[#9a6bff] to-[#6d43e0] text-white shadow-[0_0_22px_rgba(139,92,246,0.55)]"
              : "glass text-[#b3add6]"
        )}
      >
        {done ? <Check size={13} strokeWidth={3} /> : <CategoryIcon category={category} size={13} />}
      </div>
    </div>
  );
}
