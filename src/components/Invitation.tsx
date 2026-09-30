"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dictionaries, type Locale } from "@/lib/i18n";
import CeremonyCard from "./CeremonyCard";
import Cover from "./Cover";
import DressCode from "./DressCode";
import Gallery from "./Gallery";
import Guestbook from "./Guestbook";
import Hero from "./Hero";
import PartyCard from "./PartyCard";
import Venue from "./Venue";
import { useYouTubeMusic } from "./useYouTubeMusic";

export default function Invitation({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  const [opened, setOpened] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const music = useYouTubeMusic();

  useEffect(() => {
    document.body.style.overflow = coverGone ? "" : "hidden";
  }, [coverGone]);

  const handleOpen = () => {
    music.play(); // must run inside the click so browsers allow audio
    setOpened(true);
    window.scrollTo(0, 0);
    setTimeout(() => setCoverGone(true), 1700);
  };

  return (
    <>
      {/* hidden YouTube player used for the background music */}
      <div
        ref={music.hostRef}
        aria-hidden
        className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0"
      />

      <LanguageSwitch locale={locale} label={t.switchLang} dark={!coverGone} />

      {!coverGone && <Cover t={t} onOpen={handleOpen} />}

      <main
        className={`paper-bg mx-auto min-h-screen w-full max-w-[520px] overflow-hidden transition-opacity duration-1000 ${
          opened ? "opacity-100" : "opacity-0"
        }`}
      >
        {opened && (
          <>
            <Hero t={t} />
            <CeremonyCard t={t} />
            <Gallery t={t} rtl={locale === "ar"} />
            <PartyCard t={t} locale={locale} />
            <Venue t={t} locale={locale} />
            <DressCode t={t} />
            <Guestbook t={t} locale={locale} />
            <footer className="pb-24 pt-2" />
          </>
        )}
      </main>

      {opened && (
        <button
          type="button"
          onClick={music.toggle}
          aria-label={music.playing ? t.music.pause : t.music.play}
          className="fixed bottom-5 end-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/25 bg-[radial-gradient(circle_at_35%_30%,#7a1822,#4a0d13)] shadow-[0_8px_20px_rgba(81,20,25,0.45)] transition-transform hover:scale-105 active:scale-95"
        >
          <span className="flex h-5 items-end gap-[3px]" dir="ltr">
            {[0, 0.25, 0.5, 0.15].map((d, i) => (
              <span
                key={i}
                className={`w-[4px] rounded-full bg-white ${music.playing ? "eq-bar" : ""}`}
                style={{ height: `${[40, 70, 100, 55][i]}%`, animationDelay: `${d}s` }}
              />
            ))}
          </span>
        </button>
      )}
    </>
  );
}

function LanguageSwitch({ locale, label, dark }: { locale: Locale; label: string; dark: boolean }) {
  const other = locale === "en" ? "ar" : "en";
  return (
    <Link
      href={`/${other}`}
      hrefLang={other}
      className={`fixed end-4 top-4 z-[60] rounded-full px-4 py-1.5 text-sm backdrop-blur transition-colors ${
        dark
          ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
          : "border border-wine/20 bg-white/70 text-wine shadow-sm hover:bg-white"
      } ${other === "ar" ? "font-[family-name:var(--font-amiri)]" : "font-[family-name:var(--font-lora)]"}`}
    >
      {label}
    </Link>
  );
}
