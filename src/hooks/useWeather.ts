"use client";

import { useEffect, useState } from "react";
import type { WeatherDay } from "@/lib/types";

const CACHE_KEY = "nossa-viagem:weather";
const TRIP_DAY = new Date("2026-10-20T00:00:00-03:00");

interface WeatherResult {
  status: "future" | "loading" | "ready" | "error";
  days: WeatherDay[];
  daysUntil: number;
}

export function useWeather(): WeatherResult {
  const [result, setResult] = useState<WeatherResult>({ status: "loading", days: [], daysUntil: 999 });

  useEffect(() => {
    const now = new Date();
    const daysUntil = Math.ceil((TRIP_DAY.getTime() - now.getTime()) / 86_400_000);
    if (daysUntil > 16) {
      setResult({ status: "future", days: [], daysUntil });
      return;
    }
    if (daysUntil < -3) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as { days?: WeatherDay[] } | null;
        setResult({ status: cached?.days?.length ? "ready" : "future", days: cached?.days ?? [], daysUntil });
      } catch {
        setResult({ status: "future", days: [], daysUntil });
      }
      return;
    }

    const load = async () => {
      try {
        const url =
          "https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333" +
          "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
          "&timezone=America%2FSao_Paulo&start_date=2026-10-20&end_date=2026-10-21";
        const response = await fetch(url);
        if (!response.ok) throw new Error("weather");
        const data = (await response.json()) as {
          daily: {
            time: string[];
            weather_code: number[];
            temperature_2m_max: number[];
            temperature_2m_min: number[];
            precipitation_probability_max: number[];
          };
        };
        const days: WeatherDay[] = data.daily.time.map((date, i) => ({
          date,
          code: data.daily.weather_code[i],
          max: Math.round(data.daily.temperature_2m_max[i]),
          min: Math.round(data.daily.temperature_2m_min[i]),
          rain: Math.round(data.daily.precipitation_probability_max[i] ?? 0),
        }));
        localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), days }));
        setResult({ status: "ready", days, daysUntil });
      } catch {
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as { days?: WeatherDay[] } | null;
          if (cached?.days?.length) {
            setResult({ status: "ready", days: cached.days, daysUntil });
            return;
          }
        } catch {
          /* ignore */
        }
        setResult({ status: "error", days: [], daysUntil });
      }
    };
    void load();
  }, []);

  return result;
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Céu limpo";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Neblina";
  if (code <= 57) return "Garoa";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Granizo leve";
  if (code <= 82) return "Pancadas de chuva";
  return "Trovoadas";
}
