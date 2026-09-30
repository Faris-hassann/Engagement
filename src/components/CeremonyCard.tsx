import type { Dict } from "@/lib/i18n";
import Reveal from "./Reveal";

export function DateBlock({ t, showAt }: { t: Dict; showAt: boolean }) {
  return (
    <div className="mt-6 text-cream">
      <div className="flex justify-center gap-16 font-body text-[13px] font-light text-cream/70">
        <span>{showAt ? t.atTime : t.time}</span>
        <span>{t.weekday}</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <span className="font-heading text-[40px] font-light leading-none">{t.dayNumber}</span>
        <span className="h-[46px] w-px bg-cream/50" />
        <span className="flex flex-col items-start font-heading text-[14px] font-light leading-[25px]">
          <span>{t.monthName}</span>
          <span>{t.yearNumber}</span>
        </span>
      </div>
    </div>
  );
}

export default function CeremonyCard({ t }: { t: Dict }) {
  return (
    <section className="relative px-[6%]">
      <Reveal>
        <div className="wine-card relative rounded-[14px] px-4 pb-12 pt-10 text-center">
          <h2 className="font-heading text-[19px] font-bold tracking-[0.3px] text-cream">{t.ceremonyInfo}</h2>

          <div className="mt-6 space-y-1 px-2 font-body text-[12px] font-light leading-[1.5] text-cream">
            {t.welcome.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <p className="mt-10 font-display text-[40px] font-light leading-tight text-cream">{t.groom}</p>
          <p className="mt-4 font-uchen text-[10px] font-light tracking-[1.4px] text-cream/70">{t.groomLabel}</p>
          <p className="my-4 font-amp text-[35px] leading-none text-cream">&amp;</p>
          <p className="mt-6 font-display text-[40px] font-light leading-tight text-cream">{t.bride}</p>
          <p className="mt-4 font-uchen text-[10px] font-light tracking-[1.4px] text-cream/70">{t.brideLabel}</p>

          <p className="mt-8 whitespace-pre-line font-body text-[16px] leading-[1.5] text-cream/70">
            {t.ceremonyAt}
            {"\n"}
            {t.venueShort}
          </p>

          <DateBlock t={t} showAt />

          <img
            src="/Images/flower2-decoration.webp"
            alt=""
            className="animate-sway pointer-events-none absolute -right-[9%] top-[30%] w-[27%] select-none rtl:-left-[9%] rtl:right-auto rtl:-scale-x-100"
          />
        </div>
      </Reveal>
    </section>
  );
}
