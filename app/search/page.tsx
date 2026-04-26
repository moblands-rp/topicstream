"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SearchX } from "lucide-react";
import { tmdbImageUrl, type TMDBMediaItem } from "../../lib/tmdb";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [results, setResults] = useState<TMDBMediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!query || !key) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    async function run() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${key}&language=en-US&query=${encodeURIComponent(
            query,
          )}&include_adult=false`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as { results?: TMDBMediaItem[] };
        setResults(
          (data.results ?? []).filter((item) => item.media_type === "movie" || item.media_type === "tv"),
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }
    void run();
    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Search on Topic</h1>
        <p className="text-sm text-topic-muted">
          {query ? `Results for "${query}"` : "Enter a title in the search bar to find movies and TV shows."}
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-topic-border/80 bg-topic-card p-5 text-sm text-topic-muted">
          Searching...
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-topic-border/80 bg-topic-card p-8 text-center text-topic-muted">
          <SearchX className="mx-auto mb-2 h-6 w-6" />
          No results found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {results.map((item) => {
            const type = item.media_type === "tv" ? "tv" : "movie";
            return (
              <Link
                key={`${type}-${item.id}`}
                href={`/watch/${type}/${item.id}`}
                className="group space-y-2"
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
                <p className="line-clamp-2 text-sm text-slate-200 group-hover:text-white">
                  {item.title ?? item.name ?? "Untitled"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Search on Topic</h1>
          <p className="text-sm text-topic-muted">Loading search...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}