"use client";

import { ChevronRight, Heart, ListChecks, Settings2, Wallet } from "lucide-react";
import type { Route, SubPage } from "@/lib/types";
import { useApp } from "@/services/store";
import { fmtBRL } from "@/lib/time";
import { PageHeader, stagger } from "../ui";
import { InstallCard, ShareTripButton } from "../features";

export function MaisPage({ go }: { go: (r: Route) => void }) {
  const { state } = useApp();
  const spent = state.expenses.reduce((a, e) => a + e.amount, 0);
  const remaining = Math.max(0, state.settings.budget - spent);
  const checkDone = state.checklist.filter((c) => c.done).length;

  const items: Array<{
    page: SubPage;
    icon: typeof Wallet;
    title: string;
    subtitle: string;
  }> = [
    {
      page: "gastos",
      icon: Wallet,
      title: "Gastos",
      subtitle: `${fmtBRL(remaining)} ainda disponíveis`,
    },
    {
      page: "checklist",
      icon: ListChecks,
      title: "Antes de sair",
      subtitle: `${checkDone} de ${state.checklist.length} preparados`,
    },
    {
      page: "nos",
      icon: Heart,
      title: "Nós",
      subtitle: "a nossa história, em números",
    },
    {
      page: "config",
      icon: Settings2,
      title: "Configurações",
      subtitle: "administração da viagem",
    },
  ];

  return (
    <div className="pb-32">
      <PageHeader title="Mais" subtitle="o resto do nosso app" />
      <div className="space-y-2.5 px-5">
        {items.map(({ page, icon: Icon, title, subtitle }, i) => (
          <button
            key={page}
            className="card animate-fade-up flex w-full items-center gap-4 p-4 text-left transition active:scale-[0.98]"
            style={stagger(i + 1, 60)}
            onClick={() => go({ name: "sub", page })}
          >
            <div className="glass grid h-11 w-11 flex-none place-items-center rounded-2xl text-[#c4b5fd]">
              <Icon size={18} strokeWidth={1.9} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold">{title}</p>
              <p className="mt-0.5 truncate text-[12px] text-[#a6a0cc]">{subtitle}</p>
            </div>
            <ChevronRight size={17} className="flex-none text-[#8882ad]" />
          </button>
        ))}
      </div>

      <div className="animate-fade-up mt-5 space-y-2.5 px-5" style={stagger(5)}>
        <InstallCard />
        <ShareTripButton />
      </div>

      <p className="animate-fade-up mt-10 text-center text-[10.5px] font-medium tracking-[0.22em] text-[#6f6a92] uppercase" style={stagger(6)}>
        feito para nós dois · sp 2026
      </p>
    </div>
  );
}
