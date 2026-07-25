"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // The landing's "Get started" link arrives with ?mode=signup so new visitors
  // open straight into the sign-up form.
  const [mode, setMode] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "signin",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Check your email to confirm your account, then sign in. (If confirmation is disabled in Supabase, just sign in.)",
        );
        setMode("signin");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
    // On success the browser is redirected to Google, so no further work here.
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        {/* The mark is the stamp itself — the thing the whole app is about. */}
        <Logo className="mb-4 h-11 w-11 text-stamp" title="" />

        <h1 className="font-display text-4xl font-semibold tracking-tight">
          TrackMe
        </h1>
        <p className="mt-1 text-slate">
          {mode === "signin"
            ? "Sign in to your lists"
            : "Create an account to start a list"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-rule bg-card px-3 py-2 text-ink"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
            Password
          </span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-rule bg-card px-3 py-2 text-ink"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-ink px-3 py-2.5 font-medium text-ground disabled:opacity-50"
        >
          {loading ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-rule" />
        <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
          or
        </span>
        <span className="h-px flex-1 bg-rule" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="rounded-lg border border-rule bg-card px-3 py-2.5 font-medium text-ink"
      >
        Continue with Google
      </button>

      {message && <p className="text-sm text-stamp">{message}</p>}

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-sm text-slate underline underline-offset-2"
      >
        {mode === "signin"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </main>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary so it doesn't opt the whole route
  // into client-side rendering during prerender.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
