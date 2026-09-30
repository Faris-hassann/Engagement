import { EVENT } from "@/lib/config";
import type { Dict, Locale } from "@/lib/i18n";
import Reveal from "./Reveal";

export default function Venue({ t, locale }: { t: Dict; locale: Locale }) {
  const q = encodeURIComponent(EVENT.venueQuery);
  return (
    <section className="relative overflow-hidden px-[6%] pb-12 pt-14 text-center">
      <img
        src="/Images/castle-background.webp"
        alt=""
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto w-full max-w-[560px] opacity-30 mix-blend-multiply select-none"
      />
      <Reveal className="relative">
        <h2 className="font-heading text-[16px] font-bold tracking-[0.48px] text-wine">{t.venueTitle}</h2>
        <p className="mt-2 font-body text-[12px] font-light text-wine/80">{t.venueFull}</p>

        <div className="mx-auto mt-8 aspect-[338/268] w-full max-w-[338px] overflow-hidden rounded-2xl border-4 border-white/80 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.4)]">
          <iframe
            title={t.venueTitle}
            src={`https://maps.google.com/maps?q=${q}&z=15&hl=${locale}&output=embed`}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2 font-body text-sm font-semibold text-wine/80 transition-transform hover:scale-[1.03]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.27 3.13A59.8 59.8 0 0121.49 12 59.8 59.8 0 013.27 20.88L6 12zm0 0h7.5" />
          </svg>
          {t.directions}
        </a>
      </Reveal>
    </section>
  );
}
