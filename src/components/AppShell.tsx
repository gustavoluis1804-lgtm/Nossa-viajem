"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Route, TabId } from "@/lib/types";
import { StoreProvider, useApp } from "@/services/store";
import { resolveItems } from "@/data/trip";
import { itemStart, tripPhase } from "@/lib/time";
import { systemNotify } from "@/services/notify";
import { useSchedule } from "@/hooks/useSchedule";
import { BottomNav } from "./BottomNav";
import { ToastHost } from "./ToastHost";
import { HiddenNoteHost } from "./HiddenNoteHost";
import { OfflineRegistrar } from "./features";
import { HomePage } from "./pages/HomePage";
import { RoteiroPage } from "./pages/RoteiroPage";
import { MapaPage } from "./pages/MapaPage";
import { MemoriasPage } from "./pages/MemoriasPage";
import { MaisPage } from "./pages/MaisPage";
import { GastosPage } from "./pages/GastosPage";
import { ChecklistPage } from "./pages/ChecklistPage";
import { NosPage } from "./pages/NosPage";
import { ConfigPage } from "./pages/ConfigPage";
import { PlaceDetail } from "./pages/PlaceDetail";
import { Unlock } from "./Unlock";
import { Stories } from "./Stories";

function routeKey(r: Route): string {
  switch (r.name) {
    case "tab":
      return `tab-${r.tab}`;
    case "place":
      return `place-${r.id}`;
    case "sub":
      return `sub-${r.page}`;
    default:
      return r.name;
  }
}

function Shell() {
  const { hydrated } = useApp();
  const [stack, setStack] = useState<Route[]>([{ name: "tab", tab: "home" }]);
  const scrollKey = useRef("");

  const route = stack[stack.length - 1];

  const go = useCallback((r: Route) => {
    setStack((s) => {
      // trocar de aba sempre reinicia a pilha
      if (r.name === "tab") return [r];
      if (routeKey(s[s.length - 1]) === routeKey(r)) return s;
      return [...s, r];
    });
  }, []);

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const setTab = useCallback((t: TabId) => {
    setStack([{ name: "tab", tab: t }]);
  }, []);

  useEffect(() => {
    const key = routeKey(route);
    if (scrollKey.current !== key) {
      scrollKey.current = key;
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [route]);

  if (!hydrated) return <Splash />;

  return (
    <div className="app-frame">
      <div key={routeKey(route)} className="animate-fade-in min-h-[100dvh]">
        {route.name === "tab" && route.tab === "home" && <HomePage go={go} />}
        {route.name === "tab" && route.tab === "roteiro" && <RoteiroPage go={go} />}
        {route.name === "tab" && route.tab === "mapa" && <MapaPage />}
        {route.name === "tab" && route.tab === "memorias" && <MemoriasPage go={go} />}
        {route.name === "tab" && route.tab === "mais" && <MaisPage go={go} />}

        {route.name === "place" && <PlaceDetail id={route.id} go={go} onBack={back} />}
        {route.name === "sub" && route.page === "gastos" && <GastosPage go={go} onBack={back} />}
        {route.name === "sub" && route.page === "checklist" && (
          <ChecklistPage go={go} onBack={back} />
        )}
        {route.name === "sub" && route.page === "nos" && <NosPage go={go} onBack={back} />}
        {route.name === "sub" && route.page === "config" && <ConfigPage go={go} onBack={back} />}

        {route.name === "unlock" && <Unlock go={go} onBack={back} />}
        {(route.name === "recap" || route.name === "stories") && <Stories onBack={back} />}
      </div>

      {route.name === "tab" && (
        <BottomNav tab={route.tab} onChange={setTab} />
      )}
      <ToastHost />
      <HiddenNoteHost />
      <OfflineRegistrar />
      <Watchers />
    </div>
  );
}

/* ————— splash de abertura ————— */

function Splash() {
  return (
    <div className="app-frame grid min-h-[100dvh] place-items-center">
      <div className="text-center">
        <span className="mx-auto mb-5 block h-2.5 w-2.5 animate-pulse-soft rounded-full bg-[#8b5cf6] shadow-[0_0_24px_rgba(139,92,246,0.9)]" />
        <p className="text-[12px] font-bold tracking-[0.42em] text-[#a6a0cc] uppercase">
          Nossa Viagem
        </p>
        <p className="mt-2 text-[11.5px] text-[#6f6a92]">são paulo · 2026</p>
      </div>
    </div>
  );
}

/* ————— avisos de horário + marcos de progresso ————— */

function Watchers() {
  const { state, secret, pushToast, markNotified } = useApp();
  const sched = useSchedule(30000);

  // marcos: 25% / 50% / 75% / 100%
  useEffect(() => {
    const total = sched.moments.length;
    if (total === 0) return;
    const pct = (sched.doneMoments / total) * 100;
    for (const t of [25, 50, 75, 100]) {
      const key = `ms-${t}`;
      if (pct >= t && !state.notified.includes(key)) {
        markNotified(key);
        if (t === 100) {
          pushToast("Nossa primeira viagem ficou para a história. 💜", undefined, "celebrate");
        } else {
          pushToast(`${t}% da viagem concluída`, "Cada momento com você vale a pena.");
        }
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sched.doneMoments, sched.moments.length]);

  // notificações discretas: 30 e 20 minutos antes
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const phase = tripPhase(now);
      if (phase !== "today" && phase !== "during") return;
      const items = resolveItems(state, secret);
      const done = new Set(state.completed);
      const next = items.find((i) => !done.has(i.id));
      if (!next) return;
      const diff = (itemStart(next).getTime() - now.getTime()) / 60000;
      const fire = (kind: "30" | "20", title: string, body: string) => {
        const key = `${next.id}-${kind}`;
        if (state.notified.includes(key)) return;
        markNotified(key);
        pushToast(title, body);
        if (state.settings.notifications) systemNotify(title, body);
      };
      if (diff > 29.2 && diff <= 30.8) {
        fire("30", "Próximo momento chegando", `Em 30 minutos: ${next.title}.`);
      } else if (diff > 19.2 && diff <= 20.8) {
        fire("20", "Hora de seguir 💜", `Próxima parada em 20 minutos: ${next.title}.`);
      }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, [state, secret, pushToast, markNotified]);

  return null;
}

export default function AppShell() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
