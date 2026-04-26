"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Bookmark, CalendarDays, Clapperboard, Tv2 } from "lucide-react";
import {
  getMovieDetails,
  getTvDetails,
  getTvSeasonDetails,
  tmdbImageUrl,
  type TMDBEpisode,
  type TMDBMovieDetails,
  type TMDBShowDetails,
} from "../../../../lib/tmdb";
import { useWatchHistory } from "../../../../hooks/useWatchHistory";
import { useAuth } from "../../../../hooks/useAuth";
import { useWatchlist } from "../../../../hooks/useWatchlist";

type PageParams = {
  type: "movie" | "tv";
  id: string;
};

type VidKingMessage = {
  event?: string;
  currentTime?: number;
  duration?: number;
  season?: number;
  episode?: number;
};

function safeJsonParse(input: unknown): VidKingMessage | null {
  if (!input) return null;
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as VidKingMessage;
    } catch {
      return null;
    }
  }
  if (typeof input === "object") {
    return input as VidKingMessage;
  }
  return null;
}

export default function WatchPage({
  params,
}: {
  params: PageParams;
}) {
  const searchParams = useSearchParams();
  const { upsert } = useWatchHistory();
  const { currentUser } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [show, setShow] = useState<TMDBShowDetails | null>(null);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialSeason = Number(searchParams.get("season") ?? 1);
  const initialEpisode = Number(searchParams.get("episode") ?? 1);
  const initialProgress = Number(searchParams.get("progress") ?? 0);

  const [season, setSeason] = useState(Number.isNaN(initialSeason) ? 1 : initialSeason);
  const [episode, setEpisode] = useState(Number.isNaN(initialEpisode) ? 1 : initialEpisode);

  const isMovie = params.type === "movie";
  const tmdbId = Number(params.id);

  const embedSrc = useMemo(() => {
    const base = isMovie
      ? `https://www.vidking.net/embed/movie/${params.id}`
      : `https://www.vidking.net/embed/tv/${params.id}/${season}/${episode}`;
    const query = new URLSearchParams({
      color: "3b82f6",
      autoPlay: "true",
    });

    if (!isMovie) {
      query.set("nextEpisode", "true");
      query.set("episodeSelector", "true");
    }
    if (initialProgress > 0) {
      query.set("progress", String(Math.floor(initialProgress)));
    }

    return `${base}?${query.toString()}`;
  }, [episode, initialProgress, isMovie, params.id, season]);

  const fetchEpisodes = useCallback(
    async (seasonNumber: number) => {
      if (isMovie || Number.isNaN(tmdbId)) return;
      const seasonData = await getTvSeasonDetails(tmdbId, seasonNumber);
      setEpisodes(seasonData.episodes ?? []);
    },
    [isMovie, tmdbId],
  );

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError(null);
      setMovie(null);
      setShow(null);

      if (Number.isNaN(tmdbId)) {
        setError("Invalid TMDB id.");
        setLoading(false);
        return;
      }

      try {
        if (isMovie) {
          const details = await getMovieDetails(tmdbId);
          setMovie(details);
        } else {
          const details = await getTvDetails(tmdbId);
          setShow(details);
          const maxSeasons = details.number_of_seasons || 1;
          const safeSeason = Math.min(Math.max(1, season), maxSeasons);
          setSeason(safeSeason);
          await fetchEpisodes(safeSeason);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metadata.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [fetchEpisodes, isMovie, season, tmdbId]);

  useEffect(() => {
    if (isMovie) return;
    fetchEpisodes(season).catch(() => {
      setEpisodes([]);
    });
  }, [fetchEpisodes, isMovie, season]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = safeJsonParse(event.data);
      if (!data || (data.event !== "timeupdate" && data.event !== "pause")) return;

      const currentTime = Number(data.currentTime ?? 0);
      if (currentTime <= 0 || Number.isNaN(currentTime)) return;

      upsert({
        type: isMovie ? "movie" : "tv",
        tmdbId,
        season: isMovie ? undefined : season,
        episode: isMovie ? undefined : episode,
        currentTime,
        duration:
          data.duration && !Number.isNaN(Number(data.duration))
            ? Number(data.duration)
            : undefined,
      }).catch(() => {
        return;
      });
    }

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [episode, isMovie, season, tmdbId, upsert]);

  const title = isMovie ? movie?.title : show?.name;
  const overview = isMovie ? movie?.overview : show?.overview;
  const backdrop = isMovie ? movie?.backdrop_path : show?.backdrop_path;
  const poster = isMovie ? movie?.poster_path : show?.poster_path;
  const itemSaved = isInWatchlist(params.type, tmdbId);

  if (params.type !== "movie" && params.type !== "tv") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-100">
        <p className="text-sm">Invalid media type. Use `/watch/movie/[id]` or `/watch/tv/[id]`.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-topic-border/80 bg-topic-card/80">
        <div className="relative aspect-[16/6] w-full">
          {backdrop ? (
            <Image
              src={tmdbImageUrl(backdrop, "original") ?? ""}
              alt={title ?? "Topic Watch"}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-slate-900 to-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 flex items-end justify-between gap-4 p-5 sm:p-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-topic-accent">Now Watching on Topic</p>
              <h1 className="text-2xl font-bold text-white sm:text-4xl">{title ?? "Loading..."}</h1>
              <p className="line-clamp-3 text-sm text-slate-200 sm:text-base">{overview ?? ""}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  {isMovie ? <Clapperboard className="h-4 w-4" /> : <Tv2 className="h-4 w-4" />}
                  {isMovie ? "Movie" : "TV Show"}
                </span>
                {!isMovie && (
                  <span className="rounded-full border border-topic-accent/40 bg-topic-accent/10 px-2 py-1 text-blue-100">
                    Season {season} Episode {episode}
                  </span>
                )}
                {title && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) return;
                      if (itemSaved) {
                        void removeFromWatchlist(params.type, tmdbId);
                        return;
                      }
                      void addToWatchlist({
                        tmdbId,
                        type: params.type,
                        title,
                        posterPath: poster ?? null,
                        backdropPath: backdrop ?? null,
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-topic-accent/50 bg-topic-accent/10 px-3 py-1 text-blue-100"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {currentUser ? (itemSaved ? "Remove Watchlist" : "Add Watchlist") : "Login to Save"}
                  </button>
                )}
                {!currentUser && (
                  <Link href="/login" className="text-blue-300 underline underline-offset-4">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
            {poster && (
              <div className="relative hidden h-44 w-32 overflow-hidden rounded-lg border border-topic-border md:block">
                <Image
                  src={tmdbImageUrl(poster, "w500") ?? ""}
                  alt={title ?? "Poster"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-topic-border/80 bg-black">
        <div className="aspect-video w-full">
          <iframe
            src={embedSrc}
            className="h-full w-full"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            loading="lazy"
            allowFullScreen
            referrerPolicy="origin"
            title={title ? `${title} - Topic Player` : "Topic Player"}
          />
        </div>
      </section>

      {loading && (
        <div className="rounded-xl border border-topic-border/80 bg-topic-card p-4 text-sm text-topic-muted">
          Loading metadata...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
          <p className="inline-flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      {!isMovie && show && (
        <section className="space-y-4 rounded-2xl border border-topic-border/80 bg-topic-card/70 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-topic-accent" />
            <h2 className="text-lg font-semibold text-white">Season & Episode Selector</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {show.seasons
              .filter((seasonItem) => seasonItem.season_number > 0)
              .map((seasonItem) => (
                <button
                  key={seasonItem.id}
                  type="button"
                  onClick={() => {
                    setSeason(seasonItem.season_number);
                    setEpisode(1);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    season === seasonItem.season_number
                      ? "border-topic-accent bg-topic-accent/20 text-blue-100"
                      : "border-topic-border bg-slate-900/70 text-slate-300 hover:text-white"
                  }`}
                >
                  S{seasonItem.season_number} ({seasonItem.episode_count})
                </button>
              ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                type="button"
                onClick={() => setEpisode(ep.episode_number)}
                className={`rounded-xl border p-3 text-left transition ${
                  episode === ep.episode_number
                    ? "border-topic-accent bg-topic-accent/20 text-blue-100"
                    : "border-topic-border bg-slate-900/60 text-slate-200 hover:border-topic-accent/50"
                }`}
              >
                <p className="text-xs text-slate-400">Episode {ep.episode_number}</p>
                <p className="mt-1 line-clamp-2 text-sm font-medium">{ep.name}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
