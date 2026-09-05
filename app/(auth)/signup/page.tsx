"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    if (!cleanUsername) {
      setError("Please enter a username.");
      setLoading(false);
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      setLoading(false);
      return;
    }

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setError(
        "Username can only contain lowercase letters, numbers, dots, underscores, and hyphens."
      );
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,

      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/confirm`,

        data: {
          name: cleanName,
          username: cleanUsername,
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    /*
     * If email confirmation is enabled in Supabase,
     * signUp() will normally return a user without a session.
     */
    if (!data.session) {
      router.push(
        `signup/verify?email=${encodeURIComponent(cleanEmail)}`
      );
      return;
    }

    /*
     * If email confirmation is disabled, the user
     * already has a session and can continue directly
     * to profile onboarding.
     */
    router.push("/onboarding/profile");
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-brightText outline-none transition placeholder:text-mutedText focus:border-accent focus:ring-1 focus:ring-accent";

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-brightText sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-2 text-xs font-medium text-mutedText">
              <span className="text-accent">01</span>
              <span>/</span>
              <span>02</span>
            </div>

            <p className="mb-2 text-sm font-medium text-accent">
              Create your account
            </p>

            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Welcome to <span className="text-accent">Studio</span>
            </h1>

            <p className="mt-3 text-sm leading-6 text-mutedText">
              Create your account to manage events, teams, attendees and your
              profile.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border bg-surface/60 p-5 sm:p-7">
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-brightText"
                >
                  Full name
                  <span className="ml-1 text-accent">*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prasen Kakade"
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-brightText"
                >
                  Username
                  <span className="ml-1 text-accent">*</span>
                </label>

                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-mutedText">
                    @
                  </span>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9._-]/g, "")
                      )
                    }
                    placeholder="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    minLength={3}
                    required
                    className={`${inputClass} pl-9`}
                  />
                </div>

                <p className="mt-2 text-xs text-mutedText">
                  Your public profile will be available at /profile/@
                  {username || "username"}.
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-brightText"
                >
                  Email
                  <span className="ml-1 text-accent">*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-brightText"
                >
                  Password
                  <span className="ml-1 text-accent">*</span>
                </label>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2.5 text-mutedText transition hover:bg-surface hover:text-brightText"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-mutedText">
                  Use at least 6 characters.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-mutedText">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-brightText transition hover:text-accent"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-5 text-center text-xs leading-5 text-mutedText">
            By creating an account, you agree to use Studio responsibly and
            provide accurate account information.
          </p>
        </div>
      </div>
    </main>
  );
}