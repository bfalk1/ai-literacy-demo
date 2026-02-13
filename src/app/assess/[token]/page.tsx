"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Invitation {
  id: string;
  candidate_email: string;
  candidate_name: string | null;
  company_id: string;
  expires_at: string;
  used_at: string | null;
  ats_job_id: string | null;
  ats_application_id: string | null;
}

export default function AssessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/invitations/validate?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid invitation');
      } else {
        setInvitation(data.invitation);
        if (data.invitation.candidate_name) {
          setName(data.invitation.candidate_name);
        }
      }
    } catch (err) {
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !name.trim()) return;

    // Store invitation data
    localStorage.setItem("invitationToken", token);
    localStorage.setItem("candidateName", name.trim());
    localStorage.setItem("candidateEmail", invitation.candidate_email);
    localStorage.setItem("companyId", invitation.company_id);
    if (invitation.ats_job_id) localStorage.setItem("atsJobId", invitation.ats_job_id);
    if (invitation.ats_application_id) localStorage.setItem("atsApplicationId", invitation.ats_application_id);

    router.push("/assessment");
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#71717a', fontSize: '14px' }}>Validating invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Invalid Invitation</h1>
          <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '8px' }}>{error}</p>
          <p style={{ fontSize: '13px', color: '#52525b' }}>
            Please contact the company that sent you this assessment link.
          </p>
        </div>
      </div>
    );
  }

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
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a' }}>
          TELESCOPIC
        </span>
      </header>

      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        maxWidth: '400px',
        margin: '0 auto',
        width: '100%',
      }}>
        <h1 style={{ 
          fontSize: 'clamp(24px, 7vw, 32px)', 
          fontWeight: 600, 
          marginBottom: '8px',
        }}>
          AI Collaboration Assessment
        </h1>
        <p style={{ 
          fontSize: '14px', 
          color: '#71717a', 
          marginBottom: '32px', 
          lineHeight: 1.5 
        }}>
          This assessment measures how effectively you work with AI tools. It takes about 10 minutes.
        </p>

        <form onSubmit={handleStart}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <p style={{ fontSize: '14px', color: '#a1a1aa' }}>{invitation?.candidate_email}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: '100%',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                color: '#fff',
                outline: 'none',
              }}
              required
            />
          </div>

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
            }}
          >
            Start assessment
          </button>
        </form>
      </main>

      <footer style={{ padding: '20px 0', paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
        <p style={{ fontSize: '12px', color: '#3f3f46' }}>Powered by HireUp</p>
      </footer>
    </div>
  );
}
