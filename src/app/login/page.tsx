"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(from);
      } else {
        setError("Wrong password. Please try again.");
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-sm">
            N
          </div>
          <p className="text-xs text-slate-400 font-medium mb-1">Nagarkot Forwarders</p>
          <h1 className="text-xl font-bold text-slate-900">Quote Comparison</h1>
          <p className="text-sm text-slate-400 mt-1">Internal dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <p className="text-sm text-slate-500 mb-6 text-center">
            Enter the dashboard password to continue.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-3">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Password"
              autoComplete="current-password"
              className={`w-full h-11 border rounded-xl px-4 text-sm text-slate-800 bg-white
                placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20
                focus:border-brand-500 transition-colors
                ${error ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="h-11 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-100
                disabled:text-slate-400 text-white text-sm font-semibold rounded-xl
                transition-colors mt-1"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          For internal use only · Nagarkot Forwarders
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
