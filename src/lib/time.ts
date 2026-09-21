import type { TripItem, TripPhase } from "./types";

/** Fuso fixo de Brasília — a viagem é em São Paulo, independente do fuso do aparelho */
export const TZ = "-03:00";
export const TZ_NAME = "America/Sao_Paulo";

export const TRIP_START = new Date(`2026-10-20T22:00:00${TZ}`);
export const TRIP_END = new Date(`2026-10-22T00:00:00${TZ}`);
export const REL_START = new Date(`2026-09-12T16:43:00${TZ}`);

export function itemStart(item: TripItem): Date {
  return new Date(`2026-10-${20 + item.dayOffset}T${item.start}:00${TZ}`);
}

export function itemEnd(item: TripItem): Date {
  const offset = item.endOffset ?? item.dayOffset;
  const time = item.end ?? item.start;
  return new Date(`2026-10-${20 + offset}T${time}:00${TZ}`);
}

export function isHappening(item: TripItem, now: Date): boolean {
  return now >= itemStart(item) && now < itemEnd(item);
}

export function minutesTo(now: Date, target: Date): number {
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

export function durationMin(item: TripItem): number {
  return Math.max(0, Math.round((itemEnd(item).getTime() - itemStart(item).getTime()) / 60000));
}

export function fmtDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function fmtRange(item: TripItem): string {
  return item.end && item.end !== item.start ? `${item.start} — ${item.end}` : item.start;
}

/** soma minutos a um "HH:MM" (pode virar o dia) */
export function shiftTime(time: string, minutes: number): { time: string; plusOne: boolean } {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const mm = String(wrapped % 60).padStart(2, "0");
  return { time: `${hh}:${mm}`, plusOne: total >= 1440 };
}

export function fmtBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function dayInSP(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ_NAME });
}

export function tripPhase(now: Date): TripPhase {
  if (now >= TRIP_END) return "after";
  if (now >= TRIP_START) return "during";
  if (dayInSP(now) === "2026-10-20") return "today";
  return "before";
}

export interface CountParts {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  totalMin: number;
}

export function countdownTo(now: Date, target: Date): CountParts {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, totalMin: Math.floor(diff / 60000) };
}

/** partes do contador do relacionamento */
export function relParts(now: Date): { days: number; hours: number; mins: number; future: boolean } {
  const diff = now.getTime() - REL_START.getTime();
  const abs = Math.abs(diff);
  return {
    days: Math.floor(abs / 86400000),
    hours: Math.floor((abs % 86400000) / 3600000),
    mins: Math.floor((abs % 3600000) / 60000),
    future: diff < 0,
  };
}

export function weekdayLabel(isoDay: string): string {
  // isoDay: "2026-10-20"
  const d = new Date(`${isoDay}T12:00:00${TZ}`);
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: TZ_NAME }).format(d);
}

export function itemDateLabel(item: TripItem): string {
  const d = itemStart(item);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TZ_NAME,
  }).format(d);
}

export type ItemStatus = "done" | "now" | "next" | "todo";

export function statusLabel(s: ItemStatus): string {
  switch (s) {
    case "done":
      return "Concluído";
    case "now":
      return "Em andamento";
    case "next":
      return "Próximo";
    default:
      return "Ainda não começou";
  }
}
