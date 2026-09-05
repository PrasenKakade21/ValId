"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Mail, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const email = searchParams.get("email") ?? "";
  const reason = searchParams.get("reason");

  const isEmailNotConfirmed = reason === "email_not_confirmed";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(!isEmailNotConfirmed);

  async function handleSendVerification() {
    if (!email) {
      setError("We couldn't find your email address.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setMessage("A verification email has been sent.");
    setLoading(false);
  }

  async function handleResend() {
    if (!email) {
      setError("We couldn't find your email address.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("A new verification email has been sent.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-brightText sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <div className="w-full">
          {/* Progress */}
          <div className="mb-8 flex items-center gap-2 text-xs font-medium text-mutedText">
            <div className="flex items-center gap-2 text-accent">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-background">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Account</span>
            </div>

            <span className="h-px w-8 bg-border" />

            <div className="text-mutedText">
              <span>Profile</span>
            </div>
          </div>

          {/* Icon */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-accent">
            <Mail size={22} strokeWidth={1.8} />
          </div>

          {/* Header */}
          <div className="mb-7">
            <p className="mb-2 text-sm font-medium text-accent">
              {isEmailNotConfirmed ? "Verification required" : "Almost there"}
            </p>

            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              {isEmailNotConfirmed ? (
                <>
                  Verify your <span className="text-accent">email</span>
                </>
              ) : (
                <>
                  Check your <span className="text-accent">email</span>
                </>
              )}
            </h1>

            <p className="mt-3 text-sm leading-6 text-mutedText">
              {isEmailNotConfirmed
                ? "Your account has not been verified yet. Verify your email address before continuing."
                : "We sent a verification link to your email address. Verify your account to continue setting up your profile."}
            </p>
          </div>

          {/* Email */}
          <div className="mb-6 rounded-2xl border border-border bg-surface/60 p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-mutedText">
              Email address
            </p>

            <p className="break-all text-sm font-medium text-brightText">
              {email || "your email address"}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 text-sm text-mutedText">
            {isEmailNotConfirmed && !emailSent ? (
              <>
                <p>
                  Your email address hasn't been verified yet. Click the button
                  below to receive a new verification link.
                </p>

                <p>
                  We won't send another email until you ask us to.
                </p>
              </>
            ) : (
              <>
                <p>
                  Click the verification link in the email to confirm your
                  account. The link will take you back to Studio.
                </p>

                <p>
                  If you don't see the email, check your spam or junk folder.
                </p>
              </>
            )}
          </div>

          {/* Status */}
          {message && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-brightText">
              <Check size={17} className="mt-0.5 shrink-0 text-accent" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 space-y-3">
            {!isEmailNotConfirmed || emailSent ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || !email}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3.5 text-sm font-medium text-brightText transition hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />

                {loading ? "Sending..." : "Resend verification email"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={loading || !email}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mail size={16} />

                {loading ? "Sending..." : "Send verification email"}
              </button>
            )}

            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-mutedText transition hover:text-brightText"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </div>

          {/* Help */}
          <p className="mt-8 text-center text-xs leading-5 text-mutedText">
            Having trouble? Make sure you're using the same email address you
            used when creating your account.
          </p>
        </div>
      </div>
    </main>
  );
}
