"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MUSIC, youtubeId } from "@/lib/config";

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  unMute(): void;
  setVolume(v: number): void;
  destroy(): void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

/**
 * Background music from a YouTube video (hidden player).
 * Plays from MUSIC.start until MUSIC.end (or the end of the video) and loops back to MUSIC.start.
 */
export function useYouTubeMusic() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const wantPlayRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const id = youtubeId(MUSIC.url);
    if (!id || !hostRef.current) return;
    let cancelled = false;
    const mount = document.createElement("div");
    hostRef.current.appendChild(mount);

    loadApi().then(() => {
      if (cancelled || !window.YT) return;
      const playerVars: Record<string, number | string> = {
        start: MUSIC.start,
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      };
      if (MUSIC.end) playerVars.end = MUSIC.end;
      playerRef.current = new window.YT.Player(mount, {
        videoId: id,
        width: 1,
        height: 1,
        playerVars,
        events: {
          onReady: () => {
            readyRef.current = true;
            playerRef.current?.setVolume(100);
            if (wantPlayRef.current) playerRef.current?.playVideo();
          },
          onStateChange: (e: { data: number }) => {
            const S = window.YT!.PlayerState;
            if (e.data === S.PLAYING) setPlaying(true);
            else if (e.data === S.PAUSED) setPlaying(false);
            else if (e.data === S.ENDED) {
              // loop back to the configured start time
              playerRef.current?.seekTo(MUSIC.start, true);
              playerRef.current?.playVideo();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
    };
  }, []);

  // Keep the song inside [start, end] even if the browser resumes elsewhere.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const now = p.getCurrentTime();
      if (now < MUSIC.start - 1) p.seekTo(MUSIC.start, true);
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  const play = useCallback(() => {
    wantPlayRef.current = true;
    if (readyRef.current && playerRef.current) {
      playerRef.current.unMute();
      playerRef.current.playVideo();
    }
  }, []);

  const toggle = useCallback(() => {
    if (playing) {
      wantPlayRef.current = false;
      playerRef.current?.pauseVideo();
    } else {
      play();
    }
  }, [playing, play]);

  return { hostRef, playing, play, toggle };
}
