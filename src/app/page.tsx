"use client";

import Link from "next/link";

const scenarios = [
  {
    id: "legal",
    title: "Legal Assistant",
    description: "Draft a cease & desist letter for a trademark infringement case",
    icon: "⚖️",
    difficulty: "Medium",
    time: "10-15 min",
  },
  {
    id: "marketing",
    title: "Marketing Coordinator", 
    description: "Create a product launch email campaign for a new SaaS tool",
    icon: "📧",
    difficulty: "Easy",
    time: "8-12 min",
  },
  {
    id: "finance",
    title: "Financial Analyst",
    description: "Build a quarterly budget projection for a startup",
    icon: "📊",
    difficulty: "Hard",
    time: "12-18 min",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Literacy Assessment
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Test your ability to effectively collaborate with AI to accomplish real-world tasks.
            Choose a scenario below to begin.
          </p>
        </div>

        {/* Scenarios */}
        <div className="grid gap-6">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/assessment/${scenario.id}`}
              className="group block bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{scenario.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {scenario.title}
                    </h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scenario.difficulty === "Easy" ? "bg-green-500/20 text-green-400" :
                      scenario.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {scenario.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">
                      {scenario.time}
                    </span>
                  </div>
                  <p className="text-slate-400">{scenario.description}</p>
                </div>
                <div className="text-slate-500 group-hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16 bg-slate-800/30 border border-slate-700 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold">1</div>
              <div>
                <p className="text-white font-medium">Chat with AI</p>
                <p className="text-slate-400">Work with an AI assistant to complete the task</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold">2</div>
              <div>
                <p className="text-white font-medium">Show your skills</p>
                <p className="text-slate-400">Demonstrate clear prompting and iteration</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold">3</div>
              <div>
                <p className="text-white font-medium">Get scored</p>
                <p className="text-slate-400">AI evaluates your collaboration skills</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          Powered by <span className="text-blue-400 font-medium">HireUp</span>
        </div>
      </div>
    </div>
  );
}
