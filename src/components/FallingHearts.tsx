"use client";

import { useEffect, useState } from "react";

const COLORS = ["#b8862f", "#a52a36", "#c9a0a0", "#8c1d28"];

type Heart = { left: number; size: number; duration: number; delay: number; drift: number; spin: number; color: string };

export default function FallingHearts({ count = 14 }: { count?: number }) {
  // generated on the client only to avoid hydration mismatches
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    setHearts(
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        size: 12 + Math.random() * 16,
        duration: 9 + Math.random() * 9,
        delay: -Math.random() * 16,
        drift: Math.random() * 80 - 40,
        spin: Math.random() * 120 - 60,
        color: COLORS[i % COLORS.length],
      })),
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute top-0"
          style={
            {
              left: `${h.left}%`,
              width: h.size,
              height: h.size,
              fill: h.color,
              opacity: 0.85,
              "--drift": `${h.drift}px`,
              "--spin": `${h.spin}deg`,
              animation: `heart-fall ${h.duration}s linear ${h.delay}s infinite`,
            } as React.CSSProperties
          }
        >
          <path d="M12 21s-7.5-4.6-10-9.2C.3 8.4 2.2 4.5 6 4.5c2.1 0 3.4 1.1 4 2.2.6-1.1 1.9-2.2 4-2.2 3.8 0 5.7 3.9 4 7.3C19.5 16.4 12 21 12 21z" />
        </svg>
      ))}
    </div>
  );
}
