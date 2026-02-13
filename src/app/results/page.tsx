"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

interface Analysis {
  score: number;
  promptQuality: { score: number; feedback: string };
  iteration: { score: number; feedback: string };
  contextProvided: { score: number; feedback: string };
  efficiency: { score: number; feedback: string };
  summary: string;
}

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [duration, setDuration] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const saveAttempted = useRef(false);

  // Save assessment to Supabase
  const saveAssessment = async (name: string, data: any, analysisResult: Analysis) => {
    if (saveAttempted.current) return;
    saveAttempted.current = true;
    
    try {
      // Get ATS params from URL if present
      const params = new URLSearchParams(window.location.search);
      const companySlug = localStorage.getItem('companySlug');
      
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: name,
          candidateEmail: params.get('email') || localStorage.getItem('candidateEmail'),
          task: data.task,
          duration: data.duration,
          messages: data.messages,
          analysis: analysisResult,
          atsJobId: params.get('jobId'),
          atsApplicationId: params.get('applicationId'),
          companySlug,
        }),
      });
      
      if (response.ok) {
        setSaved(true);
        console.log('Assessment saved to database');
      }
    } catch (error) {
      console.error('Failed to save assessment:', error);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("candidateName") || "Candidate";
    setCandidateName(name);
    const data = localStorage.getItem("assessmentData");
    if (!data) { setLoading(false); return; }
    const parsed = JSON.parse(data);
    setAssessmentData(parsed);
    setDuration(parsed.duration);
    setMessageCount(parsed.messages?.length || 0);
    fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) })
      .then(r => r.ok ? r.json() : null)
      .then(r => { 
        if (r) {
          setAnalysis(r);
          // Save to Supabase after analysis completes
          saveAssessment(name, parsed, r);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ color: '#71717a', fontSize: '14px' }}>Analyzing...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '16px' }}>No data found</p>
          <Link href="/" style={{ color: '#a1a1aa', fontSize: '14px', textDecoration: 'none' }}>Start over →</Link>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Prompt Quality", value: analysis.promptQuality },
    { label: "Context", value: analysis.contextProvided },
    { label: "Iteration", value: analysis.iteration },
    { label: "Efficiency", value: analysis.efficiency },
  ];

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#000', color: '#fff' }}>
      {/* Header */}
      <header style={{ padding: '16px 20px', borderBottom: '1px solid #27272a' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a' }}>TELESCOPIC</span>
      </header>

      {/* Content */}
      <main style={{ padding: '24px 20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Score */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a', marginBottom: '4px' }}>
            {candidateName}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: 'clamp(48px, 15vw, 64px)', fontWeight: 600, lineHeight: 1 }}>{analysis.score}</span>
            <span style={{ fontSize: '20px', color: '#52525b' }}>/100</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', color: '#71717a' }}>
            <span>{formatTime(duration)}</span>
            <span>{Math.ceil(messageCount / 2)} prompts</span>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          {metrics.map((m) => (
            <div key={m.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#a1a1aa' }}>{m.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{m.value.score}</span>
              </div>
              <div style={{ height: '4px', backgroundColor: '#27272a', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', backgroundColor: '#71717a', borderRadius: '2px', width: `${m.value.score}%` }} />
              </div>
              <p style={{ fontSize: '12px', color: '#52525b', lineHeight: 1.5, margin: 0 }}>{m.value.feedback}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a', marginBottom: '12px' }}>SUMMARY</p>
          <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>{analysis.summary}</p>
        </div>

        {/* Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}>
          <Link
            href="/"
            style={{
              flex: 1,
              padding: '14px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 500,
              color: '#a1a1aa',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              textDecoration: 'none',
            }}
          >
            New assessment
          </Link>
          <button
            onClick={() => window.print()}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            Export
          </button>
        </div>
      </main>
    </div>
  );
}
