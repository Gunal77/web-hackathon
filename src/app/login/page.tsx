"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/collector/dashboard");
    }
  }, [isAuthenticated, router]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }
    if (login(username, password)) {
      router.push("/collector/dashboard");
    } else {
      setError("Invalid username or password. Try: collector / collector");
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Government of Tamil Nadu · Hackathon
          </h1>
          <h2 className="mt-2 text-xl font-bold text-slate-900 md:text-2xl">
            Risk & Sentiment Petition
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access the district collector dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-surface-100 bg-white p-8 shadow-lg"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter username"
                className="mt-1.5 w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
                className="mt-1.5 w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-rose-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl border border-brand-500 bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            Sign in
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">
            Demo: Use <strong>collector</strong> / <strong>collector</strong>
          </p>
        </form>
      </div>
    </div>
  );
}
