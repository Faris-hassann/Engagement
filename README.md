# Faris & Youmna — Engagement Invitation

Next.js 16 invitation site (English `/en` + Arabic `/ar`, RTL), with Supabase for RSVPs and guestbook wishes.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API)
   - `NEXT_PUBLIC_YOUTUBE_URL` — background music (any YouTube link)
   - `NEXT_PUBLIC_MUSIC_START` — start second (30 = 0:30)
   - `NEXT_PUBLIC_MUSIC_END` — end second, empty = until the end
   - `NEXT_PUBLIC_SITE_URL` — your deployed URL (for link previews)
3. Run `supabase/schema.sql` once in the Supabase SQL editor.
4. `npm run dev` → http://localhost:3000

Event details (date, venue, photos, dress colours) live in `src/lib/config.ts`; all English/Arabic text lives in `src/lib/i18n.ts`.
RSVPs are stored in the `rsvps` table (view them in the Supabase dashboard); wishes in `wishes` (shown live on the page).

`NEXT_PUBLIC_*` values are baked in at build time — after changing them, restart `npm run dev` or redeploy.
