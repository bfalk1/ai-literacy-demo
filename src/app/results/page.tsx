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
    analyzePerformance(parsed);
  }, []);

  const analyzePerformance = async (data: { messages: { role: string; content: string }[]; task: string; duration: number }) => {
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (response.ok) setAnalysis(await response.json());
    } catch (error) { console.error("Analysis error:", error); }
    finally { setLoading(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-white/50">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white/50 mb-4">No assessment data found</p>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">Start over →</Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: "text-emerald-400", bg: "from-emerald-500 to-emerald-400" };
    if (score >= 60) return { text: "text-amber-400", bg: "from-amber-500 to-amber-400" };
    return { text: "text-rose-400", bg: "from-rose-500 to-rose-400" };
  };

  const metrics = [
    { label: "Prompt Quality", desc: "Clarity and specificity of instructions", ...analysis.promptQuality },
    { label: "Context Provided", desc: "Relevant details and background given", ...analysis.contextProvided },
    { label: "Iteration", desc: "Ability to refine and improve output", ...analysis.iteration },
    { label: "Efficiency", desc: "Task completion with minimal back-and-forth", ...analysis.efficiency },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-white font-semibold">Telescopic</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Candidate info */}
        <p className="text-white/40 text-sm">{candidateName}</p>
        <h1 className="text-3xl font-bold text-white mt-1 mb-8">Assessment Results</h1>

        {/* Score card */}
        <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/40 text-sm mb-1">Overall Score</p>
              <p className={`text-6xl font-bold ${getScoreColor(analysis.score).text}`}>{analysis.score}</p>
            </div>
            <div className="text-right text-white/40">
              <p>{formatTime(duration)} duration</p>
              <p>{Math.ceil(messageCount / 2)} prompts sent</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(analysis.score).bg}`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-6 mb-8">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-medium">{m.label}</p>
                  <p className="text-white/40 text-sm">{m.desc}</p>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(m.score).text}`}>{m.score}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(m.score).bg}`} style={{ width: `${m.score}%` }} />
              </div>
              <p className="text-white/50 text-sm">{m.feedback}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">
          <p className="text-indigo-400 text-sm font-medium mb-2">Summary</p>
          <p className="text-white/80 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 py-4 text-center font-medium text-white/70 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.05] transition-colors"
          >
            New Assessment
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-4 font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl hover:opacity-90 transition-opacity"
          >
            Export Results
          </button>
        </div>
      </div>
    </div>
  );
}
