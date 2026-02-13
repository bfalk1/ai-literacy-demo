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
      <div className="min-h-dvh bg-black flex items-center justify-center px-5">
        <p className="text-zinc-500 text-sm">Analyzing...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-4">No data found</p>
          <Link href="/" className="text-zinc-400 text-sm hover:text-white">Start over →</Link>
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
    <div className="min-h-dvh bg-black text-white">
      {/* Header */}
      <header className="px-5 py-4 border-b border-zinc-800">
        <span className="text-xs font-semibold tracking-widest text-zinc-500">TELESCOPIC</span>
      </header>

      {/* Content */}
      <main className="px-5 py-8 max-w-lg mx-auto">
        {/* Score */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 mb-1">{candidateName}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-semibold tabular-nums">{analysis.score}</span>
            <span className="text-xl text-zinc-600">/100</span>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-zinc-500">
            <span>{formatTime(duration)}</span>
            <span>{Math.ceil(messageCount / 2)} prompts</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-6 mb-10">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">{m.label}</span>
                <span className="text-sm font-medium tabular-nums">{m.value.score}</span>
              </div>
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${m.value.score}%` }} />
              </div>
              <p className="text-xs text-zinc-600">{m.value.feedback}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 mb-3">SUMMARY</p>
          <p className="text-sm text-zinc-400 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-safe">
          <Link
            href="/"
            className="flex-1 py-3.5 text-center text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl"
          >
            New assessment
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3.5 text-sm font-semibold bg-white text-black rounded-xl"
          >
            Export
          </button>
        </div>
      </main>
    </div>
  );
}
