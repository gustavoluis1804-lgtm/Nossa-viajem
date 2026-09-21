"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  Armchair,
  BedDouble,
  Car,
  Check,
  ChevronLeft,
  ClipboardList,
  Landmark,
  Lock,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { statusLabel, type ItemStatus } from "@/lib/time";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function stagger(i: number, base = 55): CSSProperties {
  return { "--d": `${i * base}ms` } as CSSProperties;
}

/* ————— ícones de categoria ————— */

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  transport: Car,
  place: Landmark,
  meal: UtensilsCrossed,
  rest: Armchair,
  prepare: ClipboardList,
  lodging: BedDouble,
  secret: Lock,
};

export function CategoryIcon({ category, size = 15 }: { category: Category; size?: number }) {
  const Icon = CATEGORY_ICON[category] ?? Landmark;
  return <Icon size={size} strokeWidth={2} />;
}

/* ————— status ————— */

export function StatusChip({ status }: { status: ItemStatus }) {
  const cls =
    status === "done"
      ? "chip chip-violet"
      : status === "now"
        ? "chip chip-violet animate-pulse-soft"
        : status === "next"
          ? "chip"
          : "chip";
  return (
    <span className={cls}>
      {status === "done" && <Check size={11} strokeWidth={3} />}
      {statusLabel(status)}
    </span>
  );
}

/* ————— progresso ————— */

export function ProgressBar({
  ratio,
  height = 8,
  danger,
}: {
  ratio: number;
  height?: number;
  danger?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
  return (
    <div className="progress-track" style={{ height }}>
      <div
        className="progress-fill"
        style={
          danger
            ? { width: `${pct}%`, background: "linear-gradient(90deg,#e11d48,#fb7185)" }
            : { width: `${pct}%` }
        }
      />
    </div>
  );
}

/* ————— cabeçalhos ————— */

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-7 pb-4">
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-[#b3add6]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function BackHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-3">
      <button
        onClick={onBack}
        aria-label="Voltar"
        className="glass grid h-10 w-10 flex-none place-items-center rounded-full text-[#c4b5fd] transition active:scale-95"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="font-display truncate text-[19px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-[12px] text-[#b3add6]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/* ————— estado vazio ————— */

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
}) {
  return (
    <div className="card mx-5 flex flex-col items-center px-6 py-10 text-center">
      <div className="glass mb-4 grid h-14 w-14 place-items-center rounded-full text-[#c4b5fd]">
        <Icon size={24} strokeWidth={1.7} />
      </div>
      <p className="font-display text-[15.5px] font-semibold">{title}</p>
      {body && <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#b3add6]">{body}</p>}
    </div>
  );
}

/* ————— sheet (modal inferior) ————— */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      <div className="animate-overlay absolute inset-0 bg-black/70 backdrop-blur-[6px]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[432px]">
        <div className="animate-sheet glass max-h-[86dvh] overflow-y-auto rounded-t-[28px] border-b-0 bg-[#100c1c]/95 px-5 pt-3 pb-8">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
          {title && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[17px] font-bold">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="glass grid h-8 w-8 place-items-center rounded-full text-[#b3add6]"
              >
                <X size={15} />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Confirmar",
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body?: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {body && <p className="mb-6 text-[13.5px] leading-relaxed text-[#b3add6]">{body}</p>}
      <div className="flex gap-3">
        <button className="btn btn-soft flex-1" onClick={onClose}>
          Cancelar
        </button>
        <button
          className={cn("btn flex-1", danger ? "btn-danger" : "btn-primary")}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
