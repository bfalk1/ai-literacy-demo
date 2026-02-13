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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-emerald-400";
    if (score >= 60) return "from-amber-500 to-amber-400";
    return "from-red-500 to-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
          <p className="text-white/50 text-sm">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/50 mb-4">No assessment data found</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            Start new assessment →
          </Link>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Prompt Quality", ...analysis.promptQuality },
    { label: "Context Provided", ...analysis.contextProvided },
    { label: "Iteration", ...analysis.iteration },
    { label: "Efficiency", ...analysis.efficiency },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-12">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-white/40 text-sm mb-1">{candidateName}</p>
          <h1 className="text-xl font-medium text-white">Assessment Results</h1>
        </div>

        {/* Score Circle */}
        <div className="flex justify-center mb-10">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(analysis.score / 100) * 402} 402`}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`${analysis.score >= 80 ? "text-emerald-500" : analysis.score >= 60 ? "text-amber-500" : "text-red-500"}`} stopColor="currentColor" />
                  <stop offset="100%" className={`${analysis.score >= 80 ? "text-emerald-400" : analysis.score >= 60 ? "text-amber-400" : "text-red-400"}`} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-semibold ${getScoreColor(analysis.score)}`}>
                {analysis.score}
              </span>
              <span className="text-white/30 text-xs">out of 100</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-10 text-sm">
          <div className="text-center">
            <div className="text-white/80 font-medium">{formatTime(duration)}</div>
            <div className="text-white/30 text-xs">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-white/80 font-medium">{Math.ceil(messageCount / 2)}</div>
            <div className="text-white/30 text-xs">Prompts</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-[#111] rounded-2xl p-6 mb-6 space-y-5">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">{metric.label}</span>
                <span className={`text-sm font-medium ${getScoreColor(metric.score)}`}>
                  {metric.score}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(metric.score)}`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <p className="text-white/40 text-xs">{metric.feedback}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-[#111] rounded-2xl p-6 mb-8">
          <h2 className="text-white/70 text-sm font-medium mb-3">Summary</h2>
          <p className="text-white/50 text-sm leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 text-center py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm font-medium transition-colors"
          >
            Try Again
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
