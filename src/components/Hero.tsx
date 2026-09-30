import type { Dict } from "@/lib/i18n";
import { EVENT } from "@/lib/config";

export default function Hero({ t }: { t: Dict }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-16 text-center">
      {/* faint castle drawing behind the names */}
      <img
        src="/Images/castle-background.webp"
        alt=""
        className="pointer-events-none absolute inset-x-0 top-[380px] mx-auto w-full max-w-[520px] opacity-25 mix-blend-multiply select-none"
      />

      <p className="relative font-cormorant text-[15px] font-semibold tracking-[2.4px] text-wine-deep">
        {t.saveTheDate}
      </p>

      {/* envelope with the couple's photo sliding out */}
      <div className="relative mx-auto mt-10 w-[68%] max-w-[300px]">
        <div className="animate-float-soft relative">
          <img src="/Images/envelope-background.webp" alt="" className="relative block w-full select-none" />

          <div
            className="absolute left-[34%] top-[1%] w-[62%]"
            style={{ animation: "float-soft 6.5s ease-in-out 0.4s infinite" }}
          >
            <div className="aspect-[221/309] rotate-[12deg] border-[7px] border-white bg-white shadow-[2px_2px_6px_rgba(0,0,0,0.3)]">
              <img src={EVENT.heroPhoto} alt={`${t.groom} & ${t.bride}`} className="h-full w-full object-cover" />
            </div>
          </div>

          <img
            src="/Images/flower2-decoration.webp"
            alt=""
            className="animate-sway pointer-events-none absolute -left-[2%] top-[-2%] w-[42%] select-none"
          />

          <img
            src="/Images/envelope-cover.webp"
            alt=""
            className="pointer-events-none absolute bottom-0 left-0 w-full select-none"
          />
        </div>
      </div>

      <div className="relative mt-12">
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-script text-[92px] font-light leading-none text-wine/15"
        >
          &amp;
        </span>
        <h1 className="relative font-display text-[46px] font-light leading-[1.2] text-wine">
          <span className="block">{t.groom}</span>
          <span className="block">{t.bride}</span>
        </h1>
      </div>
    </section>
  );
}
