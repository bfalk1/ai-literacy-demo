"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [candidateName, setCandidateName] = useState("");
  const [duration, setDuration] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    setCandidateName(localStorage.getItem("candidateName") || "Candidate");
    const data = localStorage.getItem("assessmentData");
    if (!data) { setLoading(false); return; }
    const parsed = JSON.parse(data);
    setDuration(parsed.duration);
    setMessageCount(parsed.messages?.length || 0);
    fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) })
      .then(r => r.ok ? r.json() : null)
      .then(r => { if (r) setAnalysis(r); })
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50">Analyzing...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">No data found</p>
          <Link href="/" className="text-white/70 hover:text-white">Start over →</Link>
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5">
        <div className="text-sm font-medium tracking-wide text-white/50">TELESCOPIC</div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Score */}
        <div className="mb-16">
          <div className="text-xs font-medium tracking-wide text-white/30 uppercase mb-2">{candidateName}</div>
          <div className="flex items-baseline gap-4">
            <span className="text-8xl font-medium tabular-nums">{analysis.score}</span>
            <span className="text-2xl text-white/30">/100</span>
          </div>
          <div className="mt-4 flex gap-6 text-sm text-white/40">
            <span>{formatTime(duration)}</span>
            <span>{Math.ceil(messageCount / 2)} prompts</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-8 mb-16">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">{m.label}</span>
                <span className="text-sm tabular-nums">{m.value.score}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-white/50 rounded-full" style={{ width: `${m.value.score}%` }} />
              </div>
              <p className="text-sm text-white/40">{m.value.feedback}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mb-16">
          <div className="text-xs font-medium tracking-wide text-white/30 uppercase mb-4">Summary</div>
          <p className="text-white/60 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 py-4 text-center text-sm font-medium text-white/50 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            New assessment
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-4 text-sm font-medium bg-white text-black rounded-xl hover:bg-white/90 transition-colors"
          >
            Export
          </button>
        </div>
      </main>
    </div>
  );
}
