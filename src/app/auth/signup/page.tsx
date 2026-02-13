"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setError("Database not configured");
      setLoading(false);
      return;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Create company
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          slug,
          owner_id: authData.user.id,
        });

      if (companyError) {
        setError(companyError.message);
        setLoading(false);
        return;
      }

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
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Create account</h1>
        <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '32px' }}>
          Set up your company to start assessing candidates
        </p>

        <form onSubmit={handleSignup}>
          {error && (
            <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #991b1b', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
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
            minLength={8}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#fff', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </main>
    </div>
  );
}
