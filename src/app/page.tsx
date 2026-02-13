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
    <div className="min-h-dvh bg-black text-white flex flex-col px-6">
      {/* Header */}
      <header className="py-5">
        <span className="text-xs font-semibold tracking-widest text-zinc-500">TELESCOPIC</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col justify-center py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          AI Collaboration
        </h1>
        <p className="text-base text-zinc-500 mb-10 max-w-xs">
          Measure how effectively candidates work with AI tools.
        </p>

        <form onSubmit={handleStart} className="w-full max-w-sm">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Candidate name"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-base text-white placeholder-zinc-600 outline-none focus:border-zinc-600 mb-3"
            required
          />
          <button
            type="submit"
            className="w-full bg-white text-black text-base font-semibold py-4 rounded-xl"
          >
            Start assessment
          </button>
          <p className="text-sm text-zinc-600 text-center mt-4">
            Takes about 10 minutes
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="py-5 pb-safe">
        <p className="text-xs text-zinc-700">
          Powered by HireUp
        </p>
      </footer>
    </div>
  );
}
