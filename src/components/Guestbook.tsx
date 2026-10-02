"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import { getSupabase, WISH_COLUMNS, type Wish } from "@/lib/supabase";
import Reveal from "./Reveal";

// Wishes this browser wrote: { [wishId]: ownerToken }. The token is what allows editing/deleting.
const TOKENS_KEY = "guestbook-owner-tokens";
const NAME_KEY = "guestbook-name";

function readTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeTokens(tokens: Record<string, string>) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch {}
}

function newToken() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

const inputCls =
  "w-full rounded-[10px] border border-wine bg-transparent px-4 py-2.5 font-heading text-[14px] text-wine placeholder:text-wine/50 focus:outline-none focus:ring-2 focus:ring-wine/30";

export default function Guestbook({ t, locale }: { t: Dict; locale: Locale }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "unconfigured">("idle");
  const suggestion = useRef(0);

  const upsert = useCallback((w: Wish) => {
    setWishes((prev) => {
      const i = prev.findIndex((p) => p.id === w.id);
      if (i === -1) return [w, ...prev];
      const next = prev.slice();
      next[i] = { ...prev[i], ...w };
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => setWishes((prev) => prev.filter((p) => p.id !== id)), []);

  useEffect(() => {
    setTokens(readTokens());
    try {
      setName(localStorage.getItem(NAME_KEY) || "");
    } catch {}

    const supabase = getSupabase();
    if (!supabase) {
      setStatus("unconfigured");
      return;
    }
    let active = true;

    const load = () =>
      supabase
        .from("wishes")
        .select(WISH_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(200)
        .then(({ data, error }) => {
          if (error) console.warn("Could not load wishes:", error.message);
          if (active && data) setWishes(data as Wish[]);
        });
    load();

    const channel = supabase
      .channel("wishes-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          if (id) remove(id);
        } else {
          const { id, name, message, created_at, updated_at } = payload.new as Wish;
          upsert({ id, name, message, created_at, updated_at });
        }
      })
      .subscribe();

    // safety net in case realtime is unavailable
    const poll = setInterval(load, 30_000);

    return () => {
      active = false;
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [upsert, remove]);

  const suggest = () => {
    const list = t.suggestions;
    suggestion.current = (suggestion.current + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
    setMessage(list[suggestion.current]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const supabase = getSupabase();
    if (!supabase) {
      setStatus("unconfigured");
      return;
    }
    setStatus("sending");
    const token = newToken();
    const { data, error } = await supabase
      .from("wishes")
      .insert({ name: name.trim().slice(0, 100), message: message.trim().slice(0, 1000), locale, owner_token: token })
      .select(WISH_COLUMNS)
      .single();
    if (error || !data) {
      console.warn("Could not send wish:", error?.message);
      setStatus("error");
      return;
    }
    const nextTokens = { ...readTokens(), [data.id]: token };
    writeTokens(nextTokens);
    setTokens(nextTokens);
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {}
    upsert(data as Wish);
    setMessage("");
    setStatus("idle");
  };

  const saveEdit = async (w: Wish, newName: string, newMessage: string) => {
    const supabase = getSupabase();
    const token = tokens[w.id];
    if (!supabase || !token) return false;
    const { data, error } = await supabase.rpc("update_wish", {
      p_id: w.id,
      p_token: token,
      p_name: newName,
      p_message: newMessage,
    });
    const row = Array.isArray(data) ? data[0] : null;
    if (error || !row) {
      console.warn("Could not update wish:", error?.message);
      return false;
    }
    upsert(row as Wish);
    return true;
  };

  const deleteWish = async (w: Wish) => {
    const supabase = getSupabase();
    const token = tokens[w.id];
    if (!supabase || !token) return false;
    if (!window.confirm(t.confirmDelete)) return true;
    const { data, error } = await supabase.rpc("delete_wish", { p_id: w.id, p_token: token });
    if (error || !data) {
      console.warn("Could not delete wish:", error?.message);
      return false;
    }
    remove(w.id);
    const nextTokens = { ...readTokens() };
    delete nextTokens[w.id];
    writeTokens(nextTokens);
    setTokens(nextTokens);
    return true;
  };

  return (
    <section className="relative px-[7%] pb-10">
      <Reveal>
        <div className="relative rounded-[14px] bg-[#f7f1ea] px-[10%] pb-8 pt-8 text-center shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)]">
          <h2 className="font-heading text-[20px] font-bold tracking-[0.6px] text-wine">{t.guestbook}</h2>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <input
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePh}
              className={inputCls}
            />
            <textarea
              required
              rows={2}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.wishPh}
              className={`${inputCls} resize-none`}
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                title={t.generateWish}
                aria-label={t.generateWish}
                onClick={suggest}
                className="rounded-lg bg-wine/10 p-2 text-base leading-none transition-all duration-200 hover:scale-110"
              >
                🪄
              </button>
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-full bg-wine px-6 py-2 font-heading text-sm font-semibold text-[#ded9d7] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? t.sending : t.sendWishes}
              </button>
            </div>
            {status === "error" && <p className="text-sm text-red-700">{t.wishError}</p>}
            {status === "unconfigured" && <p className="text-sm text-red-700">{t.notConfigured}</p>}
          </form>

          <div className="no-scrollbar mt-6 max-h-[360px] space-y-3 overflow-y-auto text-start">
            {wishes.length === 0 ? (
              <p className="text-center font-heading text-[14px] text-wine/80">{t.noWishes}</p>
            ) : (
              wishes.map((w) => (
                <WishItem
                  key={w.id}
                  wish={w}
                  t={t}
                  locale={locale}
                  mine={Boolean(tokens[w.id])}
                  onSave={saveEdit}
                  onDelete={deleteWish}
                />
              ))
            )}
          </div>

          <img
            src="/Images/flower2-decoration.webp"
            alt=""
            className="pointer-events-none absolute -bottom-16 -left-[12%] w-[22%] rotate-[40deg] select-none rtl:-right-[12%] rtl:left-auto"
          />
        </div>
      </Reveal>
    </section>
  );
}

function WishItem({
  wish,
  t,
  locale,
  mine,
  onSave,
  onDelete,
}: {
  wish: Wish;
  t: Dict;
  locale: Locale;
  mine: boolean;
  onSave: (w: Wish, name: string, message: string) => Promise<boolean>;
  onDelete: (w: Wish) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(wish.name);
  const [message, setMessage] = useState(wish.message);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const startEdit = () => {
    setName(wish.name);
    setMessage(wish.message);
    setFailed(false);
    setEditing(true);
  };

  const save = async () => {
    if (!name.trim() || !message.trim()) return;
    setBusy(true);
    const ok = await onSave(wish, name.trim(), message.trim());
    setBusy(false);
    setFailed(!ok);
    if (ok) setEditing(false);
  };

  const del = async () => {
    setBusy(true);
    const ok = await onDelete(wish);
    setBusy(false);
    setFailed(!ok);
  };

  const date = new Date(wish.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className={`rounded-[10px] px-4 py-3 shadow-sm ${mine ? "bg-white/80 ring-1 ring-wine/15" : "bg-white/60"}`}>
      {editing ? (
        <div className="space-y-2">
          <input
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputCls} py-1.5`}
            aria-label={t.namePh}
          />
          <textarea
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputCls} resize-none py-1.5`}
            aria-label={t.wishPh}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={busy}
              className="rounded-full px-4 py-1.5 font-heading text-xs text-wine/80 hover:bg-wine/10"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy || !name.trim() || !message.trim()}
              className="rounded-full bg-wine px-4 py-1.5 font-heading text-xs font-semibold text-[#ded9d7] disabled:opacity-50"
            >
              {t.save}
            </button>
          </div>
          {failed && <p className="text-xs text-red-700">{t.wishError}</p>}
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="font-heading text-[14px] font-bold text-wine" dir="auto">
              {wish.name}
              {mine && <span className="ms-2 text-[11px] font-normal text-wine/60">({t.you})</span>}
            </p>
            <span className="shrink-0 pt-0.5 font-heading text-[11px] text-wine/50">
              {date}
              {wish.updated_at ? ` · ${t.edited}` : ""}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-line break-words font-body text-[13px] text-wine/85" dir="auto">
            {wish.message}
          </p>
          {mine && (
            <div className="mt-2 flex justify-end gap-1">
              <button
                type="button"
                onClick={startEdit}
                disabled={busy}
                className="flex items-center gap-1 rounded-full px-3 py-1 font-heading text-xs text-wine/80 transition-colors hover:bg-wine/10"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.86 4.49l2.65 2.65M4 20l4.2-.93L19.5 7.78a1.87 1.87 0 000-2.65l-.63-.63a1.87 1.87 0 00-2.65 0L4.93 15.8 4 20z"
                  />
                </svg>
                {t.edit}
              </button>
              <button
                type="button"
                onClick={del}
                disabled={busy}
                className="flex items-center gap-1 rounded-full px-3 py-1 font-heading text-xs text-red-800/80 transition-colors hover:bg-red-800/10"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3"
                  />
                </svg>
                {t.del}
              </button>
            </div>
          )}
          {failed && <p className="mt-1 text-xs text-red-700">{t.wishError}</p>}
        </>
      )}
    </div>
  );
}
