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
    const name = localStorage.getItem("candidateName") || "Candidate";
    setCandidateName(name);

    const data = localStorage.getItem("assessmentData");
    if (!data) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(data);
    setDuration(parsed.duration);
    setMessageCount(parsed.messages?.length || 0);
    analyzePerformance(parsed);
  }, []);

  const analyzePerformance = async (data: { messages: { role: string; content: string }[]; task: string; duration: number }) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setAnalysis(await response.json());
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const getColor = (score: number) => score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";
  const getBarColor = (score: number) => score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-rose-400";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 mx-auto mb-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
          <p className="text-[14px] text-white/40">Analyzing performance...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#000] flex items-center justify-center p-5">
        <div className="text-center">
          <p className="text-[14px] text-white/50 mb-4">No assessment data found</p>
          <Link href="/" className="text-[14px] text-white/70 hover:text-white transition-colors">
            Start over →
          </Link>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Prompt quality", ...analysis.promptQuality },
    { label: "Context provided", ...analysis.contextProvided },
    { label: "Iteration", ...analysis.iteration },
    { label: "Efficiency", ...analysis.efficiency },
  ];

  return (
    <div className="min-h-screen bg-[#000] p-5">
      <div className="max-w-lg mx-auto py-8">
        {/* Header */}
        <p className="text-[13px] text-white/40">{candidateName}</p>
        <h1 className="text-[22px] font-medium text-white tracking-tight mt-1">Results</h1>

        {/* Score */}
        <div className="flex items-baseline gap-4 mt-8 mb-8">
          <span className={`text-[64px] font-medium leading-none tracking-tight ${getColor(analysis.score)}`}>
            {analysis.score}
          </span>
          <div className="text-[14px] text-white/40 space-y-0.5">
            <p>{formatTime(duration)}</p>
            <p>{Math.ceil(messageCount / 2)} prompts</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-6 mb-8">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] text-white/70">{m.label}</span>
                <span className={`text-[14px] font-medium ${getColor(m.score)}`}>{m.score}</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getBarColor(m.score)}`} style={{ width: `${m.score}%` }} />
              </div>
              <p className="text-[13px] text-white/40 mt-2 leading-relaxed">{m.feedback}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mb-8">
          <p className="text-[13px] text-white/40 mb-2">Summary</p>
          <p className="text-[15px] text-white/70 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 py-3 text-center text-[14px] font-medium text-white/70 bg-white/[0.04] hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            Try again
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 text-[14px] font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
