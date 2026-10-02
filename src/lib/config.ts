// Central place for the event details. Edit here to change dates, venue, photos, etc.
export const EVENT = {
  // 7:00 PM Cairo time (Egypt is on UTC+3 summer time until the end of October 2026)
  dateISO: "2026-10-23T19:00:00+03:00",
  durationHours: 2,
  year: 2026,
  month: 10, // October (1-12)
  day: 23,
  venueQuery: "Diva hall دار المدرعات",
  dressColors: ["#D8C3A5", "#FFFFFF"],
  heroPhoto: "/Images/hero.jpg",
  gallery: [
    "/Images/gallery-1.jpg",
    "/Images/gallery-2.jpg",
    "/Images/gallery-4.jpg",
    "/Images/gallery-5.jpg",
  ],
};

export const MUSIC = {
  url: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/watch?v=vrwVkS_bT8c",
  start: Number(process.env.NEXT_PUBLIC_MUSIC_START || 33),
  end: process.env.NEXT_PUBLIC_MUSIC_END ? Number(process.env.NEXT_PUBLIC_MUSIC_END) : undefined,
};

export function youtubeId(url: string): string | null {
  const m =
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(url) ? url : null;
}
