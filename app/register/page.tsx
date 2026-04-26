"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await register(name, email, password);
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }
    router.push("/watchlist");
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-topic-border/80 bg-topic-card/70 p-6 shadow-glow">
      <h1 className="text-2xl font-semibold text-white">Create your Topic account</h1>
      <p className="mt-1 text-sm text-topic-muted">Sign up and keep your watchlist synced on this device.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="w-full rounded-lg border border-topic-border bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-topic-accent"
        />
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
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password (min 6 characters)"
          className="w-full rounded-lg border border-topic-border bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-topic-accent"
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-topic-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-topic-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-300 hover:text-blue-200">
          Login
        </Link>
      </p>
    </div>
  );
}
