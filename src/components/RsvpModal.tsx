"use client";

import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

export default function RsvpModal({ t, locale, onClose }: { t: Dict; locale: Locale; onClose: () => void }) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || attending === null) return;
    setStatus("sending");
    const supabase = getSupabase();
    if (!supabase) {
      console.warn("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");
      setStatus("error");
      return;
    }
    const { error } = await supabase.from("rsvps").insert({ name: name.trim().slice(0, 100), attending, locale });
    setStatus(error ? "error" : "done");
    if (error) console.error(error);
  };

  const option = (value: boolean, label: string, icon: React.ReactNode) => {
    const selected = attending === value;
    return (
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all duration-200 ${
          selected ? "border-wine/60 bg-wine/5" : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50"
        }`}
      >
        <input
          type="radio"
          name="attending"
          className="sr-only"
          checked={selected}
          onChange={() => setAttending(value)}
        />
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            selected ? "bg-wine text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </label>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300 ${
        shown ? "bg-black/60" : "bg-black/0"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 font-sans shadow-2xl transition-all duration-300 ${
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.rsvp.close}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === "done" ? (
          <div className="py-8 text-center">
            <p className="text-4xl">💌</p>
            <p className="mt-4 text-lg font-semibold text-gray-900">{attending ? t.rsvp.thanksYes : t.rsvp.thanksNo}</p>
          </div>
        ) : (
          <>
            <h2 className="mb-1 mt-6 text-xl font-semibold text-gray-900">{t.rsvp.title}</h2>
            <p className="mb-6 text-sm text-gray-500">{t.rsvp.subtitle}</p>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="rsvp-name">
                  {t.rsvp.name}
                </label>
                <input
                  id="rsvp-name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.rsvp.namePh}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 sm:text-sm"
                />
              </div>
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">{t.rsvp.question}</span>
                <div className="space-y-2">
                  {option(
                    true,
                    t.rsvp.yes,
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>,
                  )}
                  {option(
                    false,
                    t.rsvp.no,
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>,
                  )}
                </div>
              </div>
              {status === "error" && <p className="text-sm text-red-600">{t.rsvp.error}</p>}
              <button
                type="submit"
                disabled={!name.trim() || attending === null || status === "sending"}
                className="w-full rounded-xl bg-cream py-3.5 text-sm font-semibold text-wine shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {status === "sending" ? t.rsvp.submitting : t.rsvp.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
