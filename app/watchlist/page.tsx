"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useWatchlist } from "../../hooks/useWatchlist";
import { tmdbImageUrl } from "../../lib/tmdb";

export default function WatchlistPage() {
  const { currentUser } = useAuth();
  const { watchlist, removeFromWatchlist, isLoading } = useWatchlist();

  if (!currentUser) {
    return (
      <div className="rounded-2xl border border-topic-border/80 bg-topic-card/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Your Watchlist</h1>
        <p className="mt-2 text-topic-muted">Please login to view and manage your watchlist.</p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-topic-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {(currentUser.user_metadata?.display_name as string | undefined) ?? currentUser.email}
          &apos;s Watchlist
        </h1>
        <p className="text-sm text-topic-muted">Your saved movies and TV shows.</p>
      </div>
      {isLoading ? (
        <div className="rounded-2xl border border-topic-border/80 bg-topic-card/70 p-6 text-topic-muted">
          Loading watchlist...
        </div>
      ) : watchlist.length === 0 ? (
        <div className="rounded-2xl border border-topic-border/80 bg-topic-card/70 p-6 text-topic-muted">
          Your watchlist is empty. Explore and add titles from any watch page.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {watchlist.map((item) => (
            <div key={item.key} className="rounded-xl border border-topic-border/80 bg-topic-card/70 p-2">
              <Link href={`/watch/${item.type}/${item.tmdbId}`} className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-slate-800">
                  {(item.posterPath || item.backdropPath) && (
                    <Image
                      src={tmdbImageUrl(item.posterPath ?? item.backdropPath, "w500") ?? ""}
                      alt={item.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-100 group-hover:text-white">{item.title}</p>
              </Link>
              <button
                type="button"
                onClick={() => {
                  void removeFromWatchlist(item.type, item.tmdbId);
                }}
                className="mt-2 w-full rounded-md border border-topic-border px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
