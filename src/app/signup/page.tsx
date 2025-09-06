"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill all the informations.");
      return;
    }
    if (password.length < 4) {
      setError("Password needs at least 4 characters.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      // Optionally sign in immediately via API
      const resSignIn = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!resSignIn.ok) {
        router.push("/sigin-in");
        return;
      }
      router.push("/");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Registration failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-black/10 dark:border-white/15 p-6 bg-background text-foreground">
        <h1 className="text-xl font-semibold mb-4">Sign up</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Quick & Easy
        </p>

        {error ? (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm">Username</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
              placeholder="Harry Potter"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
              placeholder=" "
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
              placeholder=" "
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-md bg-foreground text-background font-medium hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-xs text-black/60 dark:text-white/60">
          Already have an account? <a className="underline" href="/sigin-in">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
}


