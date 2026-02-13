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

    // Get AI analysis
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
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBar = (score: number) => {
    const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No assessment data found</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Start new assessment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Assessment Complete</h1>
          <p className="text-slate-400">{candidateName}</p>
        </div>

        {/* Overall Score */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 text-center">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysis.score)}`}>
            {analysis.score}
          </div>
          <p className="text-slate-400">Overall Score</p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-slate-500">
            <span>{formatTime(duration)} time</span>
            <span>{Math.ceil(messageCount / 2)} prompts</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 space-y-5">
          <h2 className="text-white font-medium mb-4">Performance Breakdown</h2>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-300">Prompt Quality</span>
              <span className={getScoreColor(analysis.promptQuality.score)}>
                {analysis.promptQuality.score}%
              </span>
            </div>
            {getScoreBar(analysis.promptQuality.score)}
            <p className="text-slate-500 text-xs mt-1">{analysis.promptQuality.feedback}</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-300">Context Provided</span>
              <span className={getScoreColor(analysis.contextProvided.score)}>
                {analysis.contextProvided.score}%
              </span>
            </div>
            {getScoreBar(analysis.contextProvided.score)}
            <p className="text-slate-500 text-xs mt-1">{analysis.contextProvided.feedback}</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-300">Iteration & Refinement</span>
              <span className={getScoreColor(analysis.iteration.score)}>
                {analysis.iteration.score}%
              </span>
            </div>
            {getScoreBar(analysis.iteration.score)}
            <p className="text-slate-500 text-xs mt-1">{analysis.iteration.feedback}</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-300">Efficiency</span>
              <span className={getScoreColor(analysis.efficiency.score)}>
                {analysis.efficiency.score}%
              </span>
            </div>
            {getScoreBar(analysis.efficiency.score)}
            <p className="text-slate-500 text-xs mt-1">{analysis.efficiency.feedback}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-white font-medium mb-3">Summary</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 text-center py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            New Assessment
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Export Results
          </button>
        </div>
      </div>
    </div>
  );
}
