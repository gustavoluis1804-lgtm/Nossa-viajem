"use client";

import { useEffect, useState } from "react";

/** Relógio do app. Retorna null até montar no cliente (evita diferença de hidratação). */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return now;
}
