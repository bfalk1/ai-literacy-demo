"use client";

import Link from "next/link";

export default function Home() {
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
        <h1 style={{ 
          fontSize: 'clamp(24px, 7vw, 32px)', 
          fontWeight: 600, 
          letterSpacing: '-0.02em', 
          color: '#fff', 
          marginBottom: '8px',
          lineHeight: 1.2,
        }}>
          AI Collaboration Assessment
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

        <div style={{ 
          backgroundColor: '#18181b', 
          border: '1px solid #27272a', 
          borderRadius: '12px', 
          padding: '24px',
          maxWidth: 'min(400px, 100%)',
        }}>
          <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '16px', lineHeight: 1.6 }}>
            Assessments are invite-only. If you received an email invitation, click the link in that email to start your assessment.
          </p>
          <p style={{ fontSize: '13px', color: '#52525b' }}>
            Are you a company? <Link href="/auth/signup" style={{ color: '#fff', textDecoration: 'none' }}>Sign up</Link> to start assessing candidates.
          </p>
        </div>
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
