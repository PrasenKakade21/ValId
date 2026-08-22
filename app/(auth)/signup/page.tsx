"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setResult("");

    console.log("Starting signup...");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Email:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
        options: {
    emailRedirectTo: `${window.location.origin}/api/auth/confirm`,
  },
    });

    console.log("Signup response:", { data, error });

    if (error) {
      setResult(`ERROR: ${error.message}`);
      setLoading(false);
      return;
    }

    setResult(
      `SUCCESS: User ID = ${data.user?.id ?? "none"}, Session = ${
        data.session ? "yes" : "no"
      }`
    );

    setLoading(false);
  }

  return (
    <main>
      <h1>Sign Up</h1>

      <form onSubmit={handleSignup}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      {result && <pre>{result}</pre>}
    </main>
  );
}