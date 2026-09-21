"use client";

import { Check, ListChecks, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Route } from "@/lib/types";
import { useApp } from "@/services/store";
import { BackHeader, ConfirmSheet, ProgressBar, cn, stagger } from "../ui";
import { Sparkles } from "../Sparkles";

export function ChecklistPage({ go, onBack }: { go: (r: Route) => void; onBack: () => void }) {
  const { state, toggleCheck, addCheck, removeCheck, pushToast } = useApp();
  const [newItem, setNewItem] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const done = state.checklist.filter((c) => c.done).length;
  const total = state.checklist.length;
  const allDone = total > 0 && done === total;

  const add = () => {
    const label = newItem.trim();
    if (!label) return;
    addCheck(label);
    setNewItem("");
  };

  return (
    <div className="pb-32">
      <BackHeader title="Antes de sair" subtitle="tudo pronto para a estrada" onBack={onBack} />

      <section className="card animate-fade-up relative mx-5 overflow-hidden p-5" style={stagger(1)}>
        {allDone && <Sparkles count={14} />}
        <div className="relative mb-3 flex items-baseline justify-between">
          <p className="text-[14px] font-semibold">
            {allDone ? (
              <span className="text-[#c4b5fd]">Tudo pronto para a viagem 💜</span>
            ) : (
              <>
                <span className="font-display text-[20px] font-bold">{done}</span> de {total}{" "}
                preparados
              </>
            )}
          </p>
          <p className="text-[12px] font-bold text-[#c4b5fd]">{total ? Math.round((done / total) * 100) : 0}%</p>
        </div>
        <ProgressBar ratio={total ? done / total : 0} />
      </section>

      {/* novo item */}
      <div className="animate-fade-up mx-5 mt-4 flex gap-2" style={stagger(2)}>
        <input
          className="input flex-1"
          placeholder="Adicionar item…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          className="btn btn-primary !rounded-2xl !px-4"
          onClick={add}
          aria-label="Adicionar item"
          disabled={!newItem.trim()}
        >
          <Plus size={17} />
        </button>
      </div>

      <section className="mt-5 space-y-1.5 px-5">
        {state.checklist.length === 0 && (
          <div className="card flex flex-col items-center px-6 py-10 text-center">
            <ListChecks size={22} className="mb-3 text-[#c4b5fd]" />
            <p className="text-[13.5px] font-semibold">Lista vazia</p>
            <p className="mt-1 text-[12px] text-[#a6a0cc]">Adicione o primeiro item acima.</p>
          </div>
        )}
        {state.checklist.map((c, i) => (
          <div
            key={c.id}
            className={cn(
              "card animate-fade-up flex items-center gap-3 !rounded-2xl px-3.5 py-3 !shadow-none",
              c.done && "opacity-60"
            )}
            style={stagger(i + 3, 22)}
          >
            <button
              className={cn("check-toggle", c.done && "on")}
              onClick={() => toggleCheck(c.id)}
              aria-label={c.done ? "Desmarcar" : "Marcar"}
            >
              {c.done && <Check size={14} strokeWidth={3} className="animate-pop" />}
            </button>
            <p
              className={cn(
                "flex-1 text-[13.5px] font-medium",
                c.done ? "text-[#948eb8] line-through" : "text-[#e9e4ff]"
              )}
            >
              {c.label}
            </p>
            <button
              aria-label={`Remover ${c.label}`}
              className="text-[#6f6a92] transition hover:text-rose-300"
              onClick={() => setToDelete(c.id)}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </section>

      <ConfirmSheet
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            removeCheck(toDelete);
            pushToast("Item removido");
          }
        }}
        title="Remover item"
        body="O item sairá da lista de preparação."
        confirmLabel="Remover"
        danger
      />
    </div>
  );
}
