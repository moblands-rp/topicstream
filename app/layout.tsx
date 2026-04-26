import type { Metadata } from "next";
import type { Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search, Tv } from "lucide-react";
import { NavAuthActions } from "../components/NavAuthActions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Topic - Stream Movies & TV Shows",
  description:
    "Topic is a high-performance streaming app for discovering and watching movies and TV shows.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/topicNoBackground.png", type: "image/png" }],
    apple: [{ url: "/topicNoBackground.png", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Topic",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="min-h-screen bg-transparent">
          <header className="sticky top-0 z-50 border-b border-topic-border/80 bg-slate-950/80 backdrop-blur-xl">
            <nav className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="group flex items-center gap-2 text-white">
                <div className="rounded-xl border border-topic-accent/40 bg-topic-accent/10 p-2 shadow-glow">
                  <Image
                    src="/topicNoBackground.png"
                    alt="Topic logo"
                    width={26}
                    height={26}
                    className="h-6 w-6 object-contain"
                    priority
                  />
                </div>
                <span className="text-xl font-semibold tracking-tight group-hover:text-topic-accent">
                  Topic
                </span>
              </Link>

              <div className="hidden items-center gap-5 text-sm text-topic-muted md:flex">
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
                <Link href="/search" className="hover:text-white">
                  Search
                </Link>
                <Link href="/watchlist" className="hover:text-white">
                  Watchlist
                </Link>
              </div>

              <form
                action="/search"
                method="GET"
                className="ml-auto flex w-full max-w-md items-center gap-2 rounded-full border border-topic-border/80 bg-topic-card/70 px-3 py-2 shadow-sm"
              >
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search movies and TV shows..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  autoComplete="off"
                />
              </form>

              <Link
                href="/search"
                className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-topic-border/80 bg-topic-card/60 text-slate-300 transition hover:text-white md:hidden"
                aria-label="Search on Topic"
              >
                <Tv className="h-4 w-4" />
              </Link>
              <NavAuthActions />
            </nav>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>

          <footer className="border-t border-topic-border/80 bg-slate-950/60">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-topic-muted sm:px-6 lg:px-8">
              <p className="font-medium text-slate-300">Topic</p>
              <p>Built for blazing-fast Vercel deployment and seamless streaming experiences.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
