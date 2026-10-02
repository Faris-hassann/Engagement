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
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
}
