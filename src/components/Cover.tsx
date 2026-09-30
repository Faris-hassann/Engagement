"use client";

import { useMemo, useState } from "react";
import type { Dict } from "@/lib/i18n";
import FallingHearts from "./FallingHearts";

const BURST_COLORS = ["#b8912f", "#a8343f", "#f5ede4", "#7a1c25", "#d4a64a"];

export default function Cover({ t, onOpen }: { t: Dict; onOpen: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const burst = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 34 + Math.random() * 0.4;
        const dist = 90 + Math.random() * 190;
        return {
          x: `${Math.cos(angle) * dist}px`,
          y: `${Math.sin(angle) * dist + 120}px`,
          r: `${Math.random() * 360 - 180}deg`,
          size: 12 + Math.random() * 14,
          color: BURST_COLORS[i % BURST_COLORS.length],
          delay: Math.random() * 0.15,
        };
      }),
    [],
  );

  const handleOpen = () => {
    if (leaving) return;
    setLeaving(true);
    onOpen();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
        leaving ? "pointer-events-none opacity-0 delay-[900ms]" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(160deg, #6e1720 0%, #561219 45%, #3f0b10 100%)" }}
    >
      <FallingHearts />

      <div
        className="relative w-[72%] max-w-[330px] transition-all duration-[1100ms] ease-[cubic-bezier(.6,-0.2,.4,1)]"
        style={{ transform: leaving ? "translateY(-120vh) rotate(-4deg)" : "none" }}
      >
        <div className="relative overflow-hidden rounded-[10px] bg-[#f7f0ea] px-6 pb-14 pt-10 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]">
          {/* corner flowers */}
          <img
            src="/Images/flower2-decoration.webp"
            alt=""
            className="pointer-events-none absolute -left-3 -top-4 w-[60px] rotate-[35deg] select-none"
          />
          <img
            src="/Images/flower2-decoration.webp"
            alt=""
            className="pointer-events-none absolute -bottom-4 -right-3 w-[60px] rotate-[215deg] select-none"
          />

          <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#7a1822,#3d060c)] shadow-[0_12px_30px_rgba(81,20,25,0.35)]">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#f7f0ea]" aria-hidden>
              <path d="M12 21s-7.5-4.6-10-9.2C.3 8.4 2.2 4.5 6 4.5c2.1 0 3.4 1.1 4 2.2.6-1.1 1.9-2.2 4-2.2 3.8 0 5.7 3.9 4 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
          </div>

          <h1 className="mt-7 font-display text-[28px] leading-[1.15] text-wine">
            {t.groom}
            <span className="my-1 block font-lora text-[18px] font-semibold">&amp;</span>
            {t.bride}
          </h1>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3 text-wine/70">
            <span className="h-px w-10 bg-wine/40" />
            <span className="text-sm">❦</span>
            <span className="h-px w-10 bg-wine/40" />
          </div>

          <p className="mt-4 font-lora text-[17px] text-wine/80">{t.coverDate}</p>
          <p className="mt-6 font-lora text-[17px] text-wine/80">{t.cordially}</p>

          <button
            type="button"
            onClick={handleOpen}
            className="relative mx-auto mt-7 flex w-fit items-center justify-center overflow-hidden rounded-full bg-[#5c1219] px-8 py-2.5 font-lora text-lg font-semibold text-[#f7f0ea] shadow-[0_10px_20px_rgba(81,20,25,0.35)] transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">{t.open}</span>
            <span
              className="absolute inset-y-0 left-0 w-1/3 bg-white/25"
              style={{ animation: "shine 2.8s ease-in-out infinite" }}
            />
          </button>
        </div>
      </div>

      {/* heart burst when opening */}
      {leaving && (
        <div className="pointer-events-none absolute left-1/2 top-[62%]">
          {burst.map((b, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className="absolute left-0 top-0"
              style={
                {
                  width: b.size,
                  height: b.size,
                  fill: b.color,
                  "--x": b.x,
                  "--y": b.y,
                  "--r": b.r,
                  animation: `heart-burst 1.4s ease-out ${b.delay}s forwards`,
                } as React.CSSProperties
              }
            >
              <path d="M12 21s-7.5-4.6-10-9.2C.3 8.4 2.2 4.5 6 4.5c2.1 0 3.4 1.1 4 2.2.6-1.1 1.9-2.2 4-2.2 3.8 0 5.7 3.9 4 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
          ))}
        </div>
      )}
    </div>
  );
}
