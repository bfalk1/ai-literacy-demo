"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState<string | null>(null);
  const companySlug = searchParams.get('company');

  useEffect(() => {
    if (companySlug) {
      localStorage.setItem("companySlug", companySlug);
      const supabase = getSupabase();
      if (supabase) {
        supabase
          .from('companies')
          .select('name')
          .eq('slug', companySlug)
          .single()
          .then(({ data }) => {
            if (data) setCompanyName(data.name);
          });
      }
    }
  }, [companySlug]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("candidateName", name.trim());
      if (email.trim()) localStorage.setItem("candidateEmail", email.trim());
      router.push("/assessment");
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
      {/* Header */}
      <header style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a' }}>
          TELESCOPIC
        </span>
        <Link href="/auth/login" style={{ fontSize: '13px', color: '#71717a', textDecoration: 'none' }}>
          Company login
        </Link>
      </header>

      {/* Main */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}>
        {companyName && (
          <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>
            Assessment for {companyName}
          </p>
        )}
        <h1 style={{ 
          fontSize: 'clamp(24px, 7vw, 32px)', 
          fontWeight: 600, 
          letterSpacing: '-0.02em', 
          color: '#fff', 
          marginBottom: '8px',
          lineHeight: 1.2,
        }}>
          AI Collaboration
        </h1>
        <p style={{ 
          fontSize: 'clamp(14px, 4vw, 16px)', 
          color: '#71717a', 
          marginBottom: '32px', 
          maxWidth: '320px', 
          lineHeight: 1.5 
        }}>
          Measure how effectively candidates work with AI tools.
        </p>

        <form onSubmit={handleStart} style={{ width: '100%', maxWidth: 'min(400px, 100%)' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: '100%',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              color: '#fff',
              outline: 'none',
              marginBottom: '12px',
              WebkitAppearance: 'none',
            }}
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            style={{
              width: '100%',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              color: '#fff',
              outline: 'none',
              marginBottom: '12px',
              WebkitAppearance: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#fff',
              color: '#000',
              fontSize: '16px',
              fontWeight: 600,
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
            }}
          >
            Start assessment
          </button>
          <p style={{ fontSize: '13px', color: '#52525b', textAlign: 'center', marginTop: '16px' }}>
            Takes about 10 minutes
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '20px 0',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      }}>
        <p style={{ fontSize: '12px', color: '#3f3f46' }}>
          Powered by HireUp
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#71717a' }}>Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
