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
    <div className="min-h-screen bg-[#000] flex items-center justify-center p-5">
      <div className="w-full max-w-xs">
        <h1 className="text-[22px] font-medium text-white tracking-tight">
          Telescopic
        </h1>
        <p className="text-[14px] text-white/50 mt-1 mb-8">
          AI collaboration assessment
        </p>

        <form onSubmit={handleStart} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-[#0f0f0f] border border-white/[0.08] rounded-lg px-4 py-3 text-[15px] text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-white text-black text-[14px] font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Start
          </button>
        </form>

        <p className="text-[13px] text-white/30 mt-8 text-center">
          Takes about 10 minutes
        </p>
      </div>
    </div>
  );
}
