"use client";

import { ArrowRight, ChevronLeft, Clock, Lock, LockOpen, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Route } from "@/lib/types";
import { useApp } from "@/services/store";
import { Sparkles } from "./Sparkles";
import { cn } from "./ui";

type Stage = "enter" | "closing" | "glow" | "reveal";

function gateDate(value: string): Date {
  return new Date(`${value}:00-03:00`);
}

export function Unlock({ go, onBack }: { go: (r: Route) => void; onBack: () => void }) {
  const { state, secret, unlockWithPassword } = useApp();
  const [stage, setStage] = useState<Stage>(state.unlocked && secret ? "reveal" : "enter");
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const gateActive =
    state.settings.secretTimeGate && Date.now() < gateDate(state.settings.secretUnlockAt).getTime();
  const cooldown = Math.max(0, Math.ceil((lockedUntil - tick) / 1000));

  const submit = async () => {
    if (!password.trim() || busy || cooldown > 0 || gateActive) return;
    setBusy(true);
    const ok = await unlockWithPassword(password);
    setBusy(false);
    if (ok) {
      setAttempts(0);
      setStage("closing");
      later(() => setStage("glow"), 650);
      later(() => setStage("reveal"), 2150);
      return;
    }

    const nextAttempts = attempts + 1;
    if (nextAttempts >= 5) {
      setAttempts(0);
      setLockedUntil(Date.now() + 30_000);
    } else {
      setAttempts(nextAttempts);
    }
    setWrong(true);
    setPassword("");
    later(() => setWrong(false), 1600);
  };

  const openRoute = () => {
    if (!secret) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(secret.mapQuery)}`,
      "_blank"
    );
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-20 bg-black transition-opacity duration-700",
          stage === "enter" ? "opacity-0" : stage === "closing" ? "opacity-100" : "opacity-0"
        )}
      />

      {stage === "enter" && (
        <div className="animate-fade-in relative z-10 flex min-h-[100dvh] flex-col px-7">
          <div className="flex items-center justify-between pt-5">
            <button
              onClick={onBack}
              aria-label="Voltar"
              className="glass grid h-10 w-10 place-items-center rounded-full text-[#c4b5fd]"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="chip">
              <ShieldCheck size={12} className="text-[#c4b5fd]" /> AES-256
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 -m-6 rounded-full bg-[#7a4de8]/25 blur-3xl" />
              <div className="glass animate-float relative grid h-20 w-20 place-items-center rounded-full border-[rgba(139,92,246,0.4)]">
                <Lock size={28} strokeWidth={1.7} className="text-[#c4b5fd]" />
              </div>
            </div>

            <h1 className="font-display mt-9 text-[24px] font-bold tracking-tight">
              Digite a palavra secreta
            </h1>
            <p className="mt-2 text-[12.5px] text-[#a6a0cc]">
              a surpresa está protegida e cifrada neste aparelho
            </p>

            {gateActive ? (
              <div className="card mt-8 w-full max-w-[290px] p-5">
                <Clock size={19} className="mx-auto text-[#c4b5fd]" />
                <p className="mt-3 text-[13.5px] font-semibold">Ainda não chegou a hora</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#a6a0cc]">
                  Essa surpresa só poderá ser aberta no momento certo.
                </p>
              </div>
            ) : (
              <div className={cn("mt-8 w-full max-w-[290px]", wrong && "animate-shake")}>
                <input
                  type="password"
                  inputMode="text"
                  autoComplete="off"
                  autoFocus
                  className="input !rounded-2xl !py-4 text-center text-[16px] tracking-[0.2em]"
                  placeholder="••••••"
                  value={password}
                  disabled={busy || cooldown > 0}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setWrong(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && void submit()}
                />
                <div className="mt-3 h-5">
                  {wrong && cooldown === 0 && (
                    <p className="animate-fade-in text-[13px] font-semibold text-[#c4b5fd]">
                      Ainda não 👀
                    </p>
                  )}
                  {cooldown > 0 && (
                    <p className="text-[12px] font-semibold text-[#c4b5fd]">
                      Muitas tentativas · aguarde {cooldown}s
                    </p>
                  )}
                </div>
                <button
                  className="btn btn-primary mt-2 w-full !py-4"
                  onClick={() => void submit()}
                  disabled={!password.trim() || busy || cooldown > 0}
                >
                  <LockOpen size={16} />
                  {busy ? "Verificando…" : "Desbloquear"}
                </button>
                <p className="mt-3 text-[10.5px] text-[#6f6a92]">
                  {Math.max(0, 5 - attempts)} tentativas antes da pausa de segurança
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {(stage === "glow" || stage === "closing") && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black">
          {stage === "glow" && (
            <>
              <div className="animate-glow h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.5)_0%,rgba(109,67,224,0.18)_45%,transparent_72%)] blur-2xl" />
              <div className="animate-scale-in absolute" style={{ "--d": "480ms" } as React.CSSProperties}>
                <div className="glass grid h-24 w-24 place-items-center rounded-full border-[rgba(196,181,253,0.5)] shadow-[0_0_80px_rgba(139,92,246,0.6)]">
                  <LockOpen size={36} strokeWidth={1.6} className="text-[#e9e4ff]" />
                </div>
              </div>
              <Sparkles count={34} />
            </>
          )}
        </div>
      )}

      {stage === "reveal" && secret && (
        <div className="animate-fade-in relative z-10 min-h-[100dvh] pb-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_50%_at_50%_0%,rgba(109,67,224,0.4),transparent_72%)]" />
          <Sparkles count={30} />

          <div className="relative px-7 pt-14 pb-8 text-center">
            <p className="animate-fade-up text-[11px] font-bold tracking-[0.4em] text-[#c4b5fd] uppercase" style={{ "--d": "100ms" } as React.CSSProperties}>
              Surpresa 💜
            </p>
            <h1 className="font-display animate-fade-up mt-4 text-[42px] leading-none font-bold tracking-tight text-gradient" style={{ "--d": "260ms" } as React.CSSProperties}>
              {secret.name.toUpperCase()}
            </h1>
            <div className="animate-fade-up mt-5 flex items-center justify-center gap-2 text-[14px] font-semibold text-[#e9e4ff]" style={{ "--d": "400ms" } as React.CSSProperties}>
              <Clock size={14} className="text-[#c4b5fd]" /> 17:40 — 19:00
            </div>
            <p className="animate-fade-up mx-auto mt-4 max-w-[270px] text-[13.5px] leading-relaxed text-[#b3add6]" style={{ "--d": "520ms" } as React.CSSProperties}>
              “{state.settings.revealPhrase}”
            </p>
          </div>

          <div className="card animate-scale-in relative mx-5 overflow-hidden" style={{ "--d": "680ms" } as React.CSSProperties}>
            <div className="h-52 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={secret.image} alt="A surpresa revelada" className="animate-kenburns h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <p className="text-[13.5px] leading-relaxed text-[#c9c4e0]">{secret.description}</p>
              <div className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-[#b3add6]">
                <MapPin size={13} className="mt-0.5 flex-none text-[#c4b5fd]" /> {secret.address}
              </div>
            </div>
          </div>

          <div className="animate-fade-up mt-5 grid grid-cols-2 gap-2.5 px-5" style={{ "--d": "800ms" } as React.CSSProperties}>
            <button className="btn btn-primary" onClick={() => go({ name: "place", id: "d2-secreto" })}>
              Ver detalhes <ArrowRight size={15} />
            </button>
            <button className="btn btn-soft" onClick={openRoute}>
              <Navigation size={15} /> Abrir rota
            </button>
          </div>
          <button className="animate-fade-up mx-auto mt-5 block text-[12px] font-medium text-[#a6a0cc] underline underline-offset-4" style={{ "--d": "900ms" } as React.CSSProperties} onClick={onBack}>
            Voltar para o roteiro
          </button>
        </div>
      )}
    </div>
  );
}
