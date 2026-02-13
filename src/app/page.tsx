"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("candidateName", name.trim());
      router.push("/assessment");
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-black text-white">
      {/* Header */}
      <header className="shrink-0 px-5 py-4">
        <span className="text-xs font-semibold tracking-widest text-zinc-500">TELESCOPIC</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center px-5 py-12">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            AI Collaboration
          </h1>
          <p className="text-base text-zinc-500 mb-8">
            Measure how effectively candidates work with AI tools.
          </p>

          <form onSubmit={handleStart} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Candidate name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-700"
              required
            />
            <button
              type="submit"
              className="w-full bg-white text-black text-sm font-semibold py-3.5 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              Start assessment
            </button>
          </form>

          <p className="text-xs text-zinc-600 text-center mt-6">
            Takes about 10 minutes
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 px-5 py-4 pb-safe">
        <p className="text-xs text-zinc-700 text-center">
          Powered by HireUp
        </p>
      </footer>
    </div>
  );
}
