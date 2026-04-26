"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }
    router.push("/watchlist");
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-topic-border/80 bg-topic-card/70 p-6 shadow-glow">
      <h1 className="text-2xl font-semibold text-white">Login to Topic</h1>
      <p className="mt-1 text-sm text-topic-muted">Access your account and personal watchlist.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-topic-border bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-topic-accent"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-topic-border bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-topic-accent"
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-topic-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm text-topic-muted">
        No account?{" "}
        <Link href="/register" className="text-blue-300 hover:text-blue-200">
          Register here
        </Link>
      </p>
    </div>
  );
}
