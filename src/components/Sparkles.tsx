"use client";

import { useMemo, type CSSProperties } from "react";

/** Partículas suaves de brilho violeta — usadas em momentos especiais. */
export function Sparkles({
  count = 22,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = (i * 37.7 + 13) % 100;
        const top = (i * 53.3 + 7) % 100;
        const size = 2 + ((i * 7) % 4);
        const dur = 2.2 + ((i * 13) % 30) / 10;
        const delay = ((i * 29) % 40) / 10;
        return { left, top, size, dur, delay };
      }),
    [count]
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className="sparkle-dot"
          style={
            {
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size,
              "--tw": `${d.dur}s`,
              "--td": `${d.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
