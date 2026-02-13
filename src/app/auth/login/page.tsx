"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setError("Database not configured");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 20px',
    }}>
      <header style={{ padding: '20px 0' }}>
        <Link href="/" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a', textDecoration: 'none' }}>
          TELESCOPIC
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Sign in</h1>
        <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '32px' }}>
          Access your company dashboard
        </p>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #991b1b', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{
              width: '100%',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              color: '#fff',
              marginBottom: '12px',
              outline: 'none',
            }}
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: '100%',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              color: '#fff',
              marginBottom: '16px',
              outline: 'none',
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#fff',
              color: '#000',
              fontSize: '16px',
              fontWeight: 600,
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{ color: '#fff', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </main>
    </div>
  );
}
