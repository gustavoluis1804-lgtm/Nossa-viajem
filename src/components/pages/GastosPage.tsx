"use client";

import { Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import type { Route } from "@/lib/types";
import { useApp } from "@/services/store";
import { EXPENSE_CATEGORIES } from "@/data/trip";
import { fmtBRL } from "@/lib/time";
import { BackHeader, ConfirmSheet, EmptyState, ProgressBar, Sheet, cn, stagger } from "../ui";

const PAYERS = ["Eu", "Ela", "Nós dois"];

export function GastosPage({ go, onBack }: { go: (r: Route) => void; onBack: () => void }) {
  const { state, addExpense, removeExpense, updateSettings, pushToast } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const budget = state.settings.budget;
  const spent = state.expenses.reduce((a, e) => a + e.amount, 0);
  const remaining = Math.max(0, budget - spent);
  const ratio = budget > 0 ? spent / budget : 0;

  // form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("transporte");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("Nós dois");
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [note, setNote] = useState("");

  const parsed = Number(amount.replace(/\./g, "").replace(",", "."));
  const valid = name.trim().length > 0 && Number.isFinite(parsed) && parsed > 0;

  const save = () => {
    if (!valid) return;
    addExpense({ name: name.trim(), category, amount: parsed, payer, time, note: note.trim() || undefined });
    pushToast("Gasto registrado", `${name.trim()} · ${fmtBRL(parsed)}`);
    setAddOpen(false);
    setName("");
    setAmount("");
    setNote("");
  };

  return (
    <div className="pb-32">
      <BackHeader
        title="Gastos"
        subtitle="o orçamento da viagem"
        onBack={onBack}
        right={
          <button
            className="glass grid h-10 w-10 place-items-center rounded-full text-[#c4b5fd] transition active:scale-95"
            onClick={() => setBudgetOpen(true)}
            aria-label="Editar orçamento"
          >
            <Pencil size={15} />
          </button>
        }
      />

      {/* resumo */}
      <section className="card animate-fade-up mx-5 p-5" style={stagger(1)}>
        <div className="mb-4 flex items-center justify-between">
          <span className="chip">
            <Wallet size={12} />
            Orçamento total
          </span>
          <button
            className="text-[12px] font-bold text-[#c4b5fd]"
            onClick={() => setBudgetOpen(true)}
          >
            {fmtBRL(budget)}
          </button>
        </div>

        <div className="space-y-3">
          <SummaryRow label="R$ disponíveis" value={fmtBRL(budget)} />
          <SummaryRow label="Já gastamos" value={fmtBRL(spent)} strong />
          <SummaryRow label="Ainda podemos gastar" value={fmtBRL(remaining)} accent />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-[11px] font-semibold text-[#a6a0cc]">
            <span>{Math.round(ratio * 100)}% utilizado</span>
            {ratio >= 0.9 && <span className="text-rose-300">atenção ao limite</span>}
          </div>
          <ProgressBar ratio={ratio} danger={ratio >= 0.9} />
        </div>
      </section>

      <button
        className="btn btn-primary animate-fade-up mx-5 mt-4 w-[calc(100%-40px)]"
        style={stagger(2)}
        onClick={() => setAddOpen(true)}
      >
        <Plus size={16} />
        Registrar gasto
      </button>

      {/* lista */}
      <section className="mt-6 space-y-2 px-5">
        {state.expenses.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Nenhum gasto ainda"
            body="Registre aqui cada gasto da viagem: transporte, comida, ingressos, lembranças…"
          />
        ) : (
          state.expenses.map((e, i) => (
            <div key={e.id} className="card animate-fade-up flex items-center gap-3.5 p-3.5" style={stagger(i + 3, 30)}>
              <div className="glass grid h-10 w-10 flex-none place-items-center rounded-2xl text-[11px] font-bold text-[#c4b5fd] uppercase">
                {e.category.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold">{e.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-[#a6a0cc]">
                  {e.category} · {e.payer} · {e.time}
                  {e.note ? ` — ${e.note}` : ""}
                </p>
              </div>
              <div className="flex flex-none items-center gap-2.5">
                <p className="text-[14px] font-bold tabular-nums">{fmtBRL(e.amount)}</p>
                <button
                  aria-label="Apagar gasto"
                  className="text-[#8882ad] transition hover:text-rose-300"
                  onClick={() => setToDelete(e.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* sheet: novo gasto */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Novo gasto">
        <p className="label">Nome</p>
        <input
          className="input mb-4"
          placeholder="Ex.: almoço na Liberdade"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <p className="label">Categoria</p>
        <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {EXPENSE_CATEGORIES.map((c) => (
            <button
              key={c}
              className={cn("chip flex-none !py-2 !text-[12px]", category === c && "chip-violet")}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <p className="label">Valor (R$)</p>
            <input
              className="input"
              placeholder="0,00"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <p className="label">Horário</p>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <p className="label">Quem pagou</p>
        <div className="mb-4 flex gap-2">
          {PAYERS.map((p) => (
            <button
              key={p}
              className={cn("chip flex-1 justify-center !py-2.5 !text-[12px]", payer === p && "chip-violet")}
              onClick={() => setPayer(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="label">Observação (opcional)</p>
        <input
          className="input mb-6"
          placeholder="Ex.: valeu cada centavo"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="btn btn-primary w-full" onClick={save} disabled={!valid}>
          Salvar gasto
        </button>
      </Sheet>

      {/* sheet: orçamento */}
      <BudgetSheet
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        current={budget}
        onSave={(v) => {
          updateSettings({ budget: v });
          pushToast("Orçamento atualizado", fmtBRL(v));
        }}
      />

      <ConfirmSheet
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && removeExpense(toDelete)}
        title="Apagar gasto"
        body="Esse registro será removido do orçamento."
        confirmLabel="Apagar"
        danger
      />
    </div>
  );
}

function SummaryRow({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[12.5px] text-[#b3add6]">{label}</span>
      <span
        className={cn(
          "font-display text-[15px] font-bold tabular-nums",
          strong && "text-[17px] text-white",
          accent && "text-[17px] text-[#c4b5fd]"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function BudgetSheet({
  open,
  onClose,
  current,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  current: number;
  onSave: (v: number) => void;
}) {
  const [value, setValue] = useState(String(current));
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return (
    <Sheet open={open} onClose={onClose} title="Orçamento total">
      <p className="label">Quanto podemos gastar (R$)</p>
      <input
        className="input mb-6"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <button
        className="btn btn-primary w-full"
        disabled={!Number.isFinite(parsed) || parsed <= 0}
        onClick={() => {
          onSave(parsed);
          onClose();
        }}
      >
        Salvar
      </button>
    </Sheet>
  );
}
