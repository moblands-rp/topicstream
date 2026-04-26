"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Flame, PlayCircle, Sparkles, TrendingUp, Tv2 } from "lucide-react";
import { tmdbImageUrl, type TMDBMediaItem } from "../lib/tmdb";
import { useWatchHistory } from "../hooks/useWatchHistory";

interface TrendingState {
  movies: TMDBMediaItem[];
  tv: TMDBMediaItem[];
}

async function fetchTrending(
  type: "movie" | "tv",
  signal?: AbortSignal,
): Promise<TMDBMediaItem[]> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) return [];
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/${type}/week?api_key=${key}&language=en-US`,
    { signal },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: TMDBMediaItem[] };
  return data.results ?? [];
}

function MediaRow({
  title,
  icon,
  items,
  mediaType,
}: {
  title: string;
  icon: React.ReactNode;
  items: TMDBMediaItem[];
  mediaType: "movie" | "tv";
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={`${mediaType}-${item.id}`}
            href={`/watch/${mediaType}/${item.id}`}
            className="group min-w-[150px] max-w-[150px] flex-shrink-0"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-topic-border/80 bg-topic-card">
              {item.poster_path ? (
                <Image
                  src={tmdbImageUrl(item.poster_path, "w500") ?? ""}
                  alt={item.title ?? item.name ?? "Poster"}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-topic-muted">
                  No Image
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-200 group-hover:text-white">
              {item.title ?? item.name ?? "Untitled"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState<TrendingState>({ movies: [], tv: [] });
  const [loading, setLoading] = useState(true);
  const { history } = useWatchHistory();

  useEffect(() => {
    const controller = new AbortController();
    async function run() {
      setLoading(true);
      const [movies, tv] = await Promise.all([
        fetchTrending("movie", controller.signal),
        fetchTrending("tv", controller.signal),
      ]);
      setTrending({ movies, tv });
      setLoading(false);
    }
    run();
    return () => controller.abort();
  }, []);

  const hero = useMemo(() => {
    if (trending.movies.length === 0) return null;
    return trending.movies[Math.floor(Math.random() * trending.movies.length)];
  }, [trending.movies]);

  const sidePicks = useMemo(() => trending.movies.slice(0, 5), [trending.movies]);

  return (
    <div className="space-y-10">
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-topic-border/80 bg-topic-card shadow-glow">
          <div className="relative aspect-[16/8] w-full">
            {hero?.backdrop_path ? (
              <Image
                src={tmdbImageUrl(hero.backdrop_path, "original") ?? ""}
                alt={hero.title ?? "Topic hero"}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-transparent" />
            <div className="absolute inset-0 flex max-w-2xl flex-col justify-end gap-3 p-6 sm:p-10">
              <p className="inline-flex w-fit items-center gap-1 rounded-full border border-topic-accent/40 bg-topic-accent/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                Trending Pick
              </p>
              <h1 className="text-3xl font-bold text-white sm:text-5xl">
                {hero?.title ?? "Start Streaming Instantly"}
              </h1>
              <p className="line-clamp-3 text-sm text-slate-200 sm:text-base">
                {hero?.overview ??
                  "Discover trending movies and TV shows, pick up where you left off, and stream smoothly with Topic."}
              </p>
              {hero && (
                <Link
                  href={`/watch/movie/${hero.id}`}
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-topic-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  <PlayCircle className="h-4 w-4" />
                  Watch Now
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-topic-border/80 bg-topic-card/80 p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-topic-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">
              Top Today
            </h2>
          </div>
          <div className="space-y-3">
            {sidePicks.map((item, index) => (
              <Link
                key={item.id}
                href={`/watch/movie/${item.id}`}
                className="group flex items-center gap-3 rounded-xl border border-topic-border/80 bg-slate-900/50 p-2.5"
              >
                <p className="w-5 text-xs font-semibold text-slate-400">{index + 1}</p>
                <div className="relative h-14 w-10 overflow-hidden rounded-md bg-slate-800">
                  {item.poster_path && (
                    <Image
                      src={tmdbImageUrl(item.poster_path, "w300") ?? ""}
                      alt={item.title ?? "Poster"}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-slate-200 group-hover:text-white">
                  {item.title ?? item.name ?? "Untitled"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Continue Watching</h2>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {history.length === 0 ? (
            <div className="rounded-xl border border-topic-border/80 bg-topic-card px-4 py-8 text-sm text-topic-muted">
              Nothing yet. Start watching on Topic and your progress will appear here.
            </div>
          ) : (
            history.map((item) => {
              const href =
                item.type === "tv"
                  ? `/watch/tv/${item.tmdbId}?season=${item.season ?? 1}&episode=${
                      item.episode ?? 1
                    }&progress=${item.currentTime}`
                  : `/watch/movie/${item.tmdbId}?progress=${item.currentTime}`;
              return (
                <Link key={item.key} href={href} className="group min-w-[220px] max-w-[220px]">
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-topic-border/80 bg-topic-card">
                    {item.backdropPath || item.posterPath ? (
                      <Image
                        src={
                          tmdbImageUrl(item.backdropPath ?? item.posterPath ?? "", "w780") ?? ""
                        }
                        alt={item.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-topic-muted">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-700/80">
                      <div
                        className="h-full bg-topic-accent"
                        style={{
                          width: `${Math.max(
                            3,
                            Math.min(
                              100,
                              item.duration ? (item.currentTime / item.duration) * 100 : 15,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-200 group-hover:text-white">
                    {item.title}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {loading ? (
        <div className="rounded-xl border border-topic-border/80 bg-topic-card px-4 py-10 text-center text-sm text-topic-muted">
          Loading trending content...
        </div>
      ) : (
        <>
          <MediaRow
            title="Trending Movies"
            icon={<Flame className="h-5 w-5 text-orange-400" />}
            items={trending.movies.slice(0, 20)}
            mediaType="movie"
          />
          <MediaRow
            title="Trending TV Shows"
            icon={<Tv2 className="h-5 w-5 text-topic-accent" />}
            items={trending.tv.slice(0, 20)}
            mediaType="tv"
          />
        </>
      )}
    </div>
  );
}
