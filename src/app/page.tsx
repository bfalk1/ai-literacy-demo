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
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-white tracking-tight mb-1">
            Telescopic
          </h1>
          <p className="text-[14px] text-white/40">
            AI collaboration assessment
          </p>
        </div>

        <form onSubmit={handleStart}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-[#0f0f0f] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[15px] text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors mb-3"
            required
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-white text-black text-[14px] font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Start
          </button>
        </form>

        <p className="text-[12px] text-white/20 mt-6 text-center">
          ~10 min · AI evaluated
        </p>
      </div>
    </div>
  );
}
