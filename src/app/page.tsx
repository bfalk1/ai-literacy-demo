"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("candidateName", name.trim());
      router.push("/assessment");
    }
  };

  return (
    <div className="page-container min-h-dvh bg-black text-white flex flex-col">
      {/* Header */}
      <header className="py-5">
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a' }}>
          TELESCOPIC
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col justify-center py-12">
        <h1 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', color: '#fff', marginBottom: '8px' }}>
          AI Collaboration
        </h1>
        <p style={{ fontSize: '16px', color: '#71717a', marginBottom: '40px', maxWidth: '300px', lineHeight: 1.5 }}>
          Measure how effectively candidates work with AI tools.
        </p>

        <form onSubmit={handleStart} style={{ width: '100%', maxWidth: '360px' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Candidate name"
            style={{
              width: '100%',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              color: '#fff',
              outline: 'none',
              marginBottom: '12px'
            }}
            required
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
              cursor: 'pointer'
            }}
          >
            Start assessment
          </button>
          <p style={{ fontSize: '14px', color: '#52525b', textAlign: 'center', marginTop: '16px' }}>
            Takes about 10 minutes
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="py-5 pb-safe">
        <p style={{ fontSize: '12px', color: '#3f3f46' }}>
          Powered by HireUp
        </p>
      </footer>
    </div>
  );
}
