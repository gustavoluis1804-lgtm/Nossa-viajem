"use client";

import { Download, Share2, Smartphone, CloudRain, Sun, CloudSun } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { shareTripCard } from "@/services/shareCard";
import { useWeather, weatherLabel } from "@/hooks/useWeather";
import { Sheet } from "./ui";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function OfflineRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");
  }, []);
  return null;
}

export function InstallCard() {
  const { pushToast } = useApp();
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [help, setHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setInstalled(standalone);
    const before = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    const done = () => {
      setInstalled(true);
      setEvent(null);
    };
    window.addEventListener("beforeinstallprompt", before);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", before);
      window.removeEventListener("appinstalled", done);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!event) {
      setHelp(true);
      return;
    }
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") pushToast("Nossa Viagem instalado", "Agora ele também está na tela inicial.");
    setEvent(null);
  };

  return (
    <>
      <button className="card flex w-full items-center gap-4 p-4 text-left transition active:scale-[0.98]" onClick={() => void install()}>
        <div className="glass grid h-11 w-11 flex-none place-items-center rounded-2xl text-[#c4b5fd]">
          <Smartphone size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold">Instalar no celular</p>
          <p className="mt-0.5 text-[12px] text-[#a6a0cc]">usar como aplicativo, inclusive offline</p>
        </div>
        <Download size={17} className="text-[#8882ad]" />
      </button>
      <Sheet open={help} onClose={() => setHelp(false)} title="Adicionar à tela inicial">
        <div className="space-y-4 text-[13px] leading-relaxed text-[#b3add6]">
          <p><strong className="text-white">Android · Chrome:</strong> toque no menu ⋮ e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.</p>
          <p><strong className="text-white">iPhone · Safari:</strong> toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p>
          <p className="text-[11.5px] text-[#8882ad]">Depois de abrir uma vez, roteiro, checklist, gastos, memórias e surpresa continuam funcionando sem internet.</p>
        </div>
      </Sheet>
    </>
  );
}

export function ShareTripButton({ className = "btn btn-soft w-full" }: { className?: string }) {
  const { state, pushToast } = useApp();
  const sched = useSchedule(60000);
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const result = await shareTripCard(state, sched.doneMoments, sched.moments.length);
          if (result === "downloaded") pushToast("Cartão salvo", "A imagem está pronta para compartilhar.");
        } catch (e) {
          if ((e as Error).name !== "AbortError") pushToast("Não consegui criar o cartão");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Share2 size={16} /> {busy ? "Criando cartão…" : "Compartilhar resumo"}
    </button>
  );
}

export function WeatherCard() {
  const weather = useWeather();
  if (weather.status === "future") return null;
  if (weather.status === "error") return null;
  if (weather.status === "loading") return <div className="card mt-4 h-24 animate-pulse-soft bg-white/5" />;

  const rainy = weather.days.some((d) => d.rain >= 40);
  return (
    <section className="card animate-fade-up mt-4 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="label !mb-0">Clima em São Paulo</p>
        <span className="chip chip-violet">previsão atualizada</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {weather.days.map((d) => (
          <div key={d.date} className="glass rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold">{d.date.endsWith("20") ? "Dia 20" : "Dia 21"}</p>
              {d.rain >= 45 ? <CloudRain size={17} className="text-[#c4b5fd]" /> : d.code === 0 ? <Sun size={17} className="text-[#c4b5fd]" /> : <CloudSun size={17} className="text-[#c4b5fd]" />}
            </div>
            <p className="font-display mt-2 text-[18px] font-bold">{d.min}° <span className="text-[#8882ad]">/</span> {d.max}°</p>
            <p className="mt-1 text-[10.5px] text-[#a6a0cc]">{weatherLabel(d.code)} · {d.rain}% chuva</p>
          </div>
        ))}
      </div>
      {rainy && <p className="mt-3 text-[11.5px] text-[#c4b5fd]">Vale manter o guarda-chuva no checklist.</p>}
    </section>
  );
}
