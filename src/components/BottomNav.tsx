"use client";

import { Ellipsis, Images, Map, Route, House } from "lucide-react";
import type { TabId } from "@/lib/types";
import { cn } from "./ui";

const TABS: Array<{ id: TabId; label: string; icon: typeof House }> = [
  { id: "home", label: "Início", icon: House },
  { id: "roteiro", label: "Roteiro", icon: Route },
  { id: "mapa", label: "Mapa", icon: Map },
  { id: "memorias", label: "Memórias", icon: Images },
  { id: "mais", label: "Mais", icon: Ellipsis },
];

export function BottomNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-[432px]">
      <div className="glass glass-strong border-x-0 border-b-0 pb-safe">
        <div className="grid grid-cols-5 px-2 pt-1.5">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="group relative flex flex-col items-center gap-1 rounded-2xl py-2 transition active:scale-95"
                aria-label={label}
              >
                <span
                  className={cn(
                    "absolute -top-1.5 h-[3px] w-8 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd] transition-all duration-300",
                    active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50"
                  )}
                />
                <Icon
                  size={21}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={cn(
                    "transition-colors duration-200",
                    active ? "text-[#c4b5fd]" : "text-[#8882ad] group-active:text-[#b3add6]"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-wide transition-colors duration-200",
                    active ? "text-[#e9e4ff]" : "text-[#8882ad]"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
