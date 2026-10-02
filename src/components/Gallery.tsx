"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EVENT } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

const photos = EVENT.gallery;

export default function Gallery({ t, rtl }: { t: Dict; rtl: boolean }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  const n = photos.length;

  const go = useCallback((dir: number) => setActive((a) => (a + dir + n) % n), [n]);

  // auto-advance
  useEffect(() => {
    if (lightbox !== null) return;
    const id = setInterval(() => go(1), 4500);
    return () => clearInterval(id);
  }, [go, lightbox, active]);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    moved.current = false;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    let dx = e.clientX - startX.current;
    if (rtl) dx = -dx;
    startX.current = null;
    if (Math.abs(dx) > 40) {
      moved.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };

  return (
    <section className="relative py-16 text-center">
      <div
        className="relative mx-auto h-[430px] w-full max-w-[430px] touch-pan-y select-none [perspective:1200px]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
      >
        {photos.map((src, i) => {
          let offset = i - active;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;
          const abs = Math.abs(offset);
          const dir = rtl ? -1 : 1;
          const style: React.CSSProperties = {
            transform: `translateX(${offset * 42 * dir}%) scale(${1 - abs * 0.16}) rotateY(${-offset * 22 * dir}deg)`,
            zIndex: 10 - abs,
            opacity: abs > 2 ? 0 : 1 - abs * 0.12,
            filter: abs ? `brightness(${1 - abs * 0.12})` : undefined,
          };
          return (
            <button
              key={src}
              type="button"
              aria-label={`${t.gallery} ${i + 1}`}
              className="absolute left-1/2 top-0 -ml-[34%] h-full w-[68%] overflow-hidden rounded-[22px] border-[3px] border-white/70 shadow-[0_18px_35px_-12px_rgba(0,0,0,0.45)] transition-all duration-700 ease-out"
              style={style}
              onClick={() => {
                if (moved.current) return;
                if (offset === 0) setLightbox(i);
                else setActive(i);
              }}
            >
              <img src={src} alt="" draggable={false} className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-wine" dir="ltr">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full bg-current transition-all duration-300 ${
              i === active ? "w-6 opacity-70" : "w-2 opacity-25 hover:opacity-40"
            }`}
          />
        ))}
      </div>

      {lightbox !== null && <Lightbox index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}

function Lightbox({
  index,
  onChange,
  onClose,
}: {
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const n = photos.length;
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % n);
      if (e.key === "ArrowLeft") onChange((index - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, n, onChange, onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/95" dir="ltr" role="dialog" aria-modal>
      <div className="flex justify-end p-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-white hover:bg-white/20"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div
        className="relative flex flex-1 items-center justify-center px-2"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (dx < -40) onChange((index + 1) % n);
          if (dx > 40) onChange((index - 1 + n) % n);
        }}
      >
        <button
          type="button"
          onClick={() => onChange((index - 1 + n) % n)}
          className="absolute left-1 z-10 flex h-10 w-10 items-center justify-center rounded-full text-4xl text-white hover:bg-white/20"
          aria-label="Previous"
        >
          ‹
        </button>
        <img src={photos[index]} alt="" className="max-h-[75vh] max-w-full rounded-lg object-contain" />
        <button
          type="button"
          onClick={() => onChange((index + 1) % n)}
          className="absolute right-1 z-10 flex h-10 w-10 items-center justify-center rounded-full text-4xl text-white hover:bg-white/20"
          aria-label="Next"
        >
          ›
        </button>
      </div>
      <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto p-4">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => onChange(i)}
            className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-md transition-all duration-200 sm:h-16 sm:w-16 ${
              i === index ? "scale-105 shadow-lg ring-2 ring-white" : "opacity-60 hover:opacity-100"
            }`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
