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
        const result = await response.json();
        setAnalysis(result);
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const getColor = (score: number) => score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  const getBarColor = (score: number) => score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-red-400";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full border border-white/10 border-t-white/40 animate-spin" />
          <p className="text-[13px] text-white/30">Analyzing...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#000] flex items-center justify-center p-5">
        <div className="text-center">
          <p className="text-white/40 text-[14px] mb-3">No data found</p>
          <Link href="/" className="text-[13px] text-blue-400">Start over →</Link>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Prompt Quality", ...analysis.promptQuality },
    { label: "Context", ...analysis.contextProvided },
    { label: "Iteration", ...analysis.iteration },
    { label: "Efficiency", ...analysis.efficiency },
  ];

  return (
    <div className="min-h-screen bg-[#000] p-5">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[12px] text-white/30 mb-0.5">{candidateName}</p>
          <h1 className="text-[20px] font-semibold text-white">Results</h1>
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-3 mb-8">
          <span className={`text-[56px] font-semibold leading-none ${getColor(analysis.score)}`}>
            {analysis.score}
          </span>
          <div className="text-[13px] text-white/30">
            <div>{formatTime(duration)} time</div>
            <div>{Math.ceil(messageCount / 2)} prompts</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4 mb-8">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[13px] text-white/50">{m.label}</span>
                <span className={`text-[13px] font-medium ${getColor(m.score)}`}>{m.score}</span>
              </div>
              <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full ${getBarColor(m.score)}`} style={{ width: `${m.score}%` }} />
              </div>
              <p className="text-[12px] text-white/25 leading-relaxed">{m.feedback}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mb-8">
          <div className="text-[11px] font-medium text-white/30 uppercase tracking-wide mb-2">Summary</div>
          <p className="text-[14px] text-white/50 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 py-2.5 text-center text-[13px] font-medium text-white/50 bg-white/[0.04] hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            Again
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
