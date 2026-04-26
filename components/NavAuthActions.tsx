"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export function NavAuthActions() {
  const { currentUser, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="hidden h-10 w-28 animate-pulse rounded-full bg-topic-card/70 lg:block" />;
  }

  if (!currentUser) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Link
          href="/login"
          className="rounded-full border border-topic-border bg-topic-card/60 px-4 py-2 text-sm text-slate-200 hover:text-white"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-topic-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link
        href="/watchlist"
        className="rounded-full border border-topic-border bg-topic-card/60 px-4 py-2 text-sm text-slate-200 hover:text-white"
      >
        Watchlist
      </Link>
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
        className="rounded-full bg-topic-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
      >
        Logout
      </button>
    </div>
  );
}
