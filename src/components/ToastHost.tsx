"use client";

import { Sparkle } from "lucide-react";
import { useApp } from "@/services/store";
import { Sparkles } from "./Sparkles";

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  const celebrate = toasts.find((t) => t.kind === "celebrate");
  const regular = toasts.filter((t) => t.kind !== "celebrate");

  return (
    <>
      {/* celebração — momento especial em tela cheia */}
      {celebrate && (
        <div
          className="animate-overlay fixed inset-0 z-[95] mx-auto grid w-full max-w-[432px] place-items-center bg-black/75 px-6 backdrop-blur-md"
          onClick={() => dismissToast(celebrate.id)}
        >
          <div className="animate-scale-in card relative w-full overflow-hidden px-6 py-10 text-center">
            <Sparkles count={30} />
            <div className="relative">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#9a6bff] to-[#6d43e0] shadow-[0_0_40px_rgba(139,92,246,0.55)]">
                <Sparkle size={26} className="text-white" />
              </div>
              <p className="font-display text-[20px] leading-snug font-bold">{celebrate.title}</p>
              {celebrate.body && (
                <p className="mt-2 text-[13.5px] text-[#c4b5fd]">{celebrate.body}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* avisos discretos no topo */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] mx-auto flex w-full max-w-[432px] flex-col items-center gap-2 px-5">
        {regular.map((t) => (
          <button
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className="animate-toast pointer-events-auto glass w-full rounded-2xl border-[rgba(139,92,246,0.3)] bg-[#151028]/95 px-4 py-3 text-left shadow-[0_12px_36px_rgba(0,0,0,0.45)]"
          >
            <p className="text-[13px] font-semibold text-[#e9e4ff]">{t.title}</p>
            {t.body && <p className="mt-0.5 text-[12px] text-[#b3add6]">{t.body}</p>}
          </button>
        ))}
      </div>
    </>
  );
}
