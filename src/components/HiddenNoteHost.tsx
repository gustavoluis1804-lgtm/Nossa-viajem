"use client";

import { MailOpen, Sparkle } from "lucide-react";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { Sparkles } from "./Sparkles";

export function HiddenNoteHost() {
  const { pendingNote, dismissHiddenNote } = useApp();
  const sched = useSchedule(60000);
  if (!pendingNote) return null;
  const item = sched.items.find((i) => i.id === pendingNote.itemId);

  return (
    <div className="animate-overlay fixed inset-0 z-[96] mx-auto grid w-full max-w-[432px] place-items-center bg-black/85 px-6 backdrop-blur-lg">
      <div className="card animate-scale-in relative w-full overflow-hidden px-7 py-9 text-center">
        <Sparkles count={28} />
        <div className="relative">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#9a6bff] to-[#6d43e0] shadow-[0_0_46px_rgba(139,92,246,0.5)]">
            <MailOpen size={25} className="text-white" />
          </div>
          <p className="mt-5 text-[10.5px] font-bold tracking-[0.28em] text-[#c4b5fd] uppercase">
            um bilhete para este momento
          </p>
          {item && <p className="font-display mt-2 text-[17px] font-bold">{item.title}</p>}
          <p className="mt-5 text-[15px] leading-relaxed text-[#e9e4ff] italic">
            “{pendingNote.text}”
          </p>
          <button className="btn btn-primary mt-7 w-full" onClick={dismissHiddenNote}>
            <Sparkle size={15} /> Guardar comigo
          </button>
        </div>
      </div>
    </div>
  );
}
