"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const message =
    searchParams.get("message") ?? "Redirecting...";
  const next = searchParams.get("next") ?? "/";
  const seconds = Number(searchParams.get("seconds") ?? "3");

  const [countdown, setCountdown] = useState(
    Number.isFinite(seconds) && seconds > 0 ? seconds : 3
  );

  useEffect(() => {
    if (countdown <= 0) {
      router.replace(next);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, next, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-brightText">
      <div className="text-center">
        <p className="text-sm text-mutedText">
          {message}
        </p>

        <p className="mt-2 text-sm text-mutedText">
          Redirecting in{" "}
          <span className="font-medium text-accent">
            {countdown}
          </span>
          ...
        </p>
      </div>
    </main>
  );
}