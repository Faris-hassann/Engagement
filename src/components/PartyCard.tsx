"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/config";
import type { Dict, Locale } from "@/lib/i18n";
import { DateBlock } from "./CeremonyCard";
import Reveal from "./Reveal";
import RsvpModal from "./RsvpModal";

const target = new Date(EVENT.dateISO).getTime();

function useCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, target - now);
  return {
    done: diff === 0,
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

function calendarUrl(t: Dict) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = new Date(EVENT.dateISO);
  const end = new Date(start.getTime() + EVENT.durationHours * 3_600_000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: t.calendarEventTitle,
    dates: `${fmt(start)}/${fmt(end)}`,
    ctz: "Africa/Cairo",
    details: t.calendarDetails,
    location: EVENT.venueQuery,
  });
  return `https://www.google.com/calendar/render?${p.toString()}`;
}

function Calendar({ t, locale }: { t: Dict; locale: Locale }) {
  const { year, month, day } = EVENT;
  const first = new Date(year, month - 1, 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const num = (n: number) => n.toLocaleString(locale === "ar" ? "ar-EG" : "en-US");

  return (
    <div className="mx-auto mt-8 w-[88%] rounded-[12px] bg-cream px-4 pb-5 pt-5 text-wine shadow-[0_10px_25px_-10px_rgba(0,0,0,0.5)]">
      <p className="font-script text-[25px] tracking-[0.6px]">{t.calendarTitle}</p>
      <div className="mt-3 border-b border-wine/40" />
      <div className="mt-3 grid grid-cols-7 gap-y-3 font-body text-[12px] font-light">
        {t.weekdaysShort.map((w) => (
          <span key={w} className="text-[10px] font-medium opacity-80">
            {w}
          </span>
        ))}
        {cells.map((c, i) =>
          c === null ? (
            <span key={`e${i}`} />
          ) : c === day ? (
            <span key={c} className="relative mx-auto flex h-7 w-8 items-center justify-center">
              {/* viewBox is cropped to the heart's own bounds so the number sits in its visual centre */}
              <svg viewBox="2 3 20 18.35" className="absolute inset-0 h-full w-full fill-wine drop-shadow-[0_2px_3px_rgba(81,20,25,0.35)]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="relative -translate-y-[2px] text-[11px] font-bold leading-none text-white">{num(c)}</span>
            </span>
          ) : (
            <span key={c} className="leading-7">
              {num(c)}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

export default function PartyCard({ t, locale }: { t: Dict; locale: Locale }) {
  const cd = useCountdown();
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const num = (n: number) => n.toLocaleString(locale === "ar" ? "ar-EG" : "en-US");

  return (
    <section className="relative px-[6%] pb-6">
      <Reveal>
        <div className="wine-card relative rounded-[14px] px-5 pb-10 pt-10 text-center">
          <h2 className="font-heading text-[20px] font-bold tracking-[0.48px] text-cream">{t.partyInfo}</h2>
          <p className="mt-8 font-body text-[20px] leading-[1.45] text-cream">{t.partyTakesPlace}</p>

          <DateBlock t={t} showAt={false} />

          <p className="mt-10 font-body text-[16px] text-cream/70">{t.countdown}</p>
          <p className="mt-3 min-h-[21px] font-body text-[14px] font-light text-cream" aria-live="polite">
            {cd &&
              (cd.done
                ? t.started
                : `${num(cd.d)} ${t.units.d} ${num(cd.h)} ${t.units.h} ${num(cd.m)} ${t.units.m} ${num(cd.s)} ${t.units.s}`)}
          </p>

          <Calendar t={t} locale={locale} />

          <div className="mt-6">
            <a
              href={calendarUrl(t)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-cream px-6 py-2 font-body text-sm font-light tracking-[0.35px] text-wine transition-transform hover:scale-[1.03]"
            >
              {t.addToCalendar}
            </a>
          </div>

          <button
            type="button"
            onClick={() => setRsvpOpen(true)}
            className="mt-6 inline-flex items-center justify-center font-heading text-sm text-cream underline underline-offset-4"
          >
            {t.confirmAttendance}
          </button>

          <img
            src="/Images/flower2-decoration.webp"
            alt=""
            className="animate-sway pointer-events-none absolute -left-[8%] top-[34%] w-[22%] -scale-x-100 select-none rtl:-right-[8%] rtl:left-auto rtl:scale-x-100"
          />
        </div>
      </Reveal>

      {rsvpOpen && <RsvpModal t={t} locale={locale} onClose={() => setRsvpOpen(false)} />}
    </section>
  );
}
