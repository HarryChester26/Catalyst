"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Đăng nhập thất bại");
      router.push("/");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Đăng nhập thất bại";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }
  // (Legacy) Kept for reference but unused now.

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-black/10 dark:border-white/15 p-6 bg-background text-foreground">
        <h1 className="text-xl font-semibold mb-4">Đăng nhập</h1>

        {error ? (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
              placeholder="••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-md bg-foreground text-background font-medium hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-4 text-xs text-black/60 dark:text-white/60">
          Chưa có tài khoản? <a className="underline" href="/sign-up">Đăng ký</a>
        </p>
      </div>
    </div>
  );
}

