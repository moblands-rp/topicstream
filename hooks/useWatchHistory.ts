"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MediaType } from "../lib/tmdb";

export const TOPIC_WATCH_HISTORY_KEY = "topic_watch_history";

export interface WatchHistoryItem {
  key: string;
  type: MediaType;
  tmdbId: number;
  season?: number;
  episode?: number;
  currentTime: number;
  duration?: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  updatedAt: number;
}

interface UpsertWatchHistoryInput {
  type: MediaType;
  tmdbId: number;
  season?: number;
  episode?: number;
  currentTime: number;
  duration?: number;
}

interface TMDBBasicDetails {
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
}

function buildKey(type: MediaType, tmdbId: number, season?: number, episode?: number) {
  if (type === "tv") {
    return `tv:${tmdbId}:s${season ?? 1}:e${episode ?? 1}`;
  }
  return `movie:${tmdbId}`;
}

function readHistory(): WatchHistoryItem[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(TOPIC_WATCH_HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as WatchHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.tmdbId === "number" && typeof item.currentTime === "number")
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function saveHistory(items: WatchHistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOPIC_WATCH_HISTORY_KEY, JSON.stringify(items.slice(0, 60)));
}

async function fetchTMDBBasicDetails(type: MediaType, tmdbId: number): Promise<TMDBBasicDetails> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return {
      title: type === "movie" ? "Movie" : "TV Show",
      posterPath: null,
      backdropPath: null,
    };
  }

  const endpoint = type === "movie" ? "movie" : "tv";
  const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${apiKey}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) {
    return {
      title: type === "movie" ? "Movie" : "TV Show",
      posterPath: null,
      backdropPath: null,
    };
  }

  const data = (await res.json()) as {
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
  };

  return {
    title: data.title ?? data.name ?? (type === "movie" ? "Movie" : "TV Show"),
    posterPath: data.poster_path ?? null,
    backdropPath: data.backdrop_path ?? null,
  };
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const refresh = useCallback(() => {
    setHistory(readHistory());
  }, []);

  const clear = useCallback(() => {
    saveHistory([]);
    setHistory([]);
  }, []);

  const upsert = useCallback(async (payload: UpsertWatchHistoryInput) => {
    if (!payload.currentTime || payload.currentTime < 5) return;

    const key = buildKey(payload.type, payload.tmdbId, payload.season, payload.episode);
    const details = await fetchTMDBBasicDetails(payload.type, payload.tmdbId);
    const nextItem: WatchHistoryItem = {
      key,
      type: payload.type,
      tmdbId: payload.tmdbId,
      season: payload.season,
      episode: payload.episode,
      currentTime: Math.floor(payload.currentTime),
      duration: payload.duration,
      title: details.title,
      posterPath: details.posterPath,
      backdropPath: details.backdropPath,
      updatedAt: Date.now(),
    };

    const current = readHistory();
    const merged = [nextItem, ...current.filter((item) => item.key !== key)].sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );
    saveHistory(merged);
    setHistory(merged);
  }, []);

  return useMemo(
    () => ({
      history,
      refresh,
      clear,
      upsert,
    }),
    [history, refresh, clear, upsert],
  );
}
