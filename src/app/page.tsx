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
    <div className="min-h-screen bg-[#000] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-[28px] font-semibold text-white tracking-tight">
          Telescopic
        </h1>
        <p className="text-[15px] text-white/50 mt-2 mb-10">
          AI collaboration assessment
        </p>

        <form onSubmit={handleStart}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-[#111] border border-white/[0.12] rounded-lg px-4 py-3.5 text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/25 transition-colors"
            required
          />
          <button
            type="submit"
            className="w-full mt-4 py-3.5 bg-white text-black text-[15px] font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Start
          </button>
        </form>

        <p className="text-[13px] text-white/25 mt-6 text-center">
          About 10 minutes
        </p>
      </div>
    </div>
  );
}
