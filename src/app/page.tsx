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
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo mark */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-8 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Telescopic
          </h1>
          <p className="text-lg text-white/40 mt-4 mb-12">
            Measure AI collaboration skills in 10 minutes
          </p>

          {/* Form */}
          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Candidate name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-4 text-base text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/[0.15] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-base font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Begin Assessment
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center">
        <p className="text-sm text-white/20">
          Powered by HireUp
        </p>
      </div>
    </div>
  );
}
