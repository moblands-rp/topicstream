"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import type { MediaType } from "../lib/tmdb";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

export interface WatchlistItem {
  key: string;
  tmdbId: number;
  type: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  createdAt: number;
}

export function useWatchlist() {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWatchlist() {
      if (!currentUser) {
        setWatchlist([]);
        return;
      }
      if (!hasSupabaseEnv()) {
        setWatchlist([]);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from("topic_watchlist")
        .select("tmdb_id, media_type, title, poster_path, backdrop_path, created_at")
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (error || !data) {
          setWatchlist([]);
        } else {
          setWatchlist(
            data.map((row) => ({
              key: `${row.media_type}:${row.tmdb_id}`,
              tmdbId: row.tmdb_id,
              type: row.media_type as MediaType,
              title: row.title,
              posterPath: row.poster_path,
              backdropPath: row.backdrop_path,
              createdAt: new Date(row.created_at).getTime(),
            })),
          );
        }
        setIsLoading(false);
      }
    }

    loadWatchlist();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const addToWatchlist = useCallback(
    async (item: Omit<WatchlistItem, "key" | "createdAt">) => {
      if (!currentUser) return { ok: false as const, message: "Please log in first." };
      if (!hasSupabaseEnv()) {
        return { ok: false as const, message: "Supabase env is missing. Configure it first." };
      }

      const { error } = await supabase.from("topic_watchlist").upsert(
        {
          user_id: currentUser.id,
          tmdb_id: item.tmdbId,
          media_type: item.type,
          title: item.title,
          poster_path: item.posterPath,
          backdrop_path: item.backdropPath,
        },
        { onConflict: "user_id,tmdb_id,media_type" },
      );

      if (error) {
        return { ok: false as const, message: error.message };
      }

      setWatchlist((current) => {
        const key = `${item.type}:${item.tmdbId}`;
        const nextItem: WatchlistItem = {
          key,
          tmdbId: item.tmdbId,
          type: item.type,
          title: item.title,
          posterPath: item.posterPath,
          backdropPath: item.backdropPath,
          createdAt: Date.now(),
        };
        return [nextItem, ...current.filter((entry) => entry.key !== key)];
      });

      return { ok: true as const };
    },
    [currentUser],
  );

  const removeFromWatchlist = useCallback(
    async (type: MediaType, tmdbId: number) => {
      if (!currentUser) return;
      if (!hasSupabaseEnv()) return;

      const { error } = await supabase
        .from("topic_watchlist")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", type);

      if (error) return;

      const key = `${type}:${tmdbId}`;
      setWatchlist((current) => current.filter((entry) => entry.key !== key));
    },
    [currentUser],
  );

  const isInWatchlist = useCallback(
    (type: MediaType, tmdbId: number) => {
      const key = `${type}:${tmdbId}`;
      return watchlist.some((entry) => entry.key === key);
    },
    [watchlist],
  );

  return {
    currentUser,
    watchlist,
    isLoading,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  };
}
