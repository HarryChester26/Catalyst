"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/UserContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill all the informations.");
      return;
    }
    if (password.length < 4) {
      setError("Password needs at least 4 characters.");
      return;
    }
    try {
      setIsLoading(true);
      const supabase = getSupabaseClient();
      // Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw new Error(signUpError.message);

      // Some projects require email confirmation; proceed to sign-in to create a session locally
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
       if (signInError) throw new Error(signInError.message);

       refreshUser();
       router.push("/");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Registration failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500">Sign up with email and password</p>
        </div>

        {error ? (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <a className="text-indigo-600 hover:underline" href="/signin">Sign in</a>
        </p>
      </div>
    </div>
  );
}


