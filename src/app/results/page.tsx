"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResultsContent() {
  const searchParams = useSearchParams();
  const scenario = searchParams.get("scenario") || "unknown";
  const turns = parseInt(searchParams.get("turns") || "0");
  const time = parseInt(searchParams.get("time") || "0");

  const scenarioNames: Record<string, string> = {
    legal: "Legal Assistant",
    marketing: "Marketing Coordinator",
    finance: "Financial Analyst",
  };

  // Simple scoring logic (in real app, this would be AI-evaluated)
  const efficiencyScore = Math.min(100, Math.max(0, 100 - (turns - 4) * 10));
  const timeScore = time < 300 ? 90 : time < 600 ? 70 : 50;
  const overallScore = Math.round((efficiencyScore + timeScore) / 2);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-2">Assessment Complete!</h1>
          <p className="text-slate-400">{scenarioNames[scenario] || scenario}</p>
        </div>

        {/* Score Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-7xl font-bold text-white mb-2">{overallScore}</div>
            <div className="text-slate-400">Overall Score</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-semibold text-blue-400">{Math.ceil(turns / 2)}</div>
              <div className="text-slate-400 text-sm">Prompts Used</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-semibold text-green-400">{formatTime(time)}</div>
              <div className="text-slate-400 text-sm">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Performance Breakdown</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Prompt Efficiency</span>
                <span className="text-slate-400">{efficiencyScore}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${efficiencyScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Time Management</span>
                <span className="text-slate-400">{timeScore}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${timeScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
          <h3 className="text-blue-400 font-semibold mb-2">💡 Tips for Improvement</h3>
          <ul className="text-slate-300 text-sm space-y-2">
            {turns > 8 && (
              <li>• Try providing more context upfront to reduce back-and-forth</li>
            )}
            {turns <= 4 && (
              <li>• Great prompt efficiency! You provided clear, detailed instructions</li>
            )}
            {time > 600 && (
              <li>• Practice will help you work faster with AI assistants</li>
            )}
            {time <= 300 && (
              <li>• Excellent time management while maintaining quality</li>
            )}
            <li>• Always review AI output for accuracy before accepting</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 text-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
          >
            Try Another Scenario
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Download Results
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          Powered by <span className="text-blue-400 font-medium">HireUp</span>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
