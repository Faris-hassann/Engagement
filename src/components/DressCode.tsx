import { EVENT } from "@/lib/config";
import type { Dict } from "@/lib/i18n";
import Reveal from "./Reveal";

export default function DressCode({ t }: { t: Dict }) {
  return (
    <section className="px-[8%] pb-16 pt-4 text-center">
      <Reveal>
        <h2 className="font-heading text-[26px] font-bold leading-[1.5] tracking-[0.6px] text-wine">{t.dressTitle}</h2>
        <p className="mt-2 font-heading text-[18px] font-light text-wine/80">{t.dressSubtitle}</p>
        <div className="mt-8 flex justify-center gap-6">
          {EVENT.dressColors.map((c) => (
            <span
              key={c}
              className="h-16 w-16 rounded-full border border-black/5 shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
