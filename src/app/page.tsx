"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("candidateName", name.trim());
      router.push("/assessment");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle grid background */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="p-6">
          <div className="text-sm font-medium tracking-wide text-white/50">TELESCOPIC</div>
        </nav>

        {/* Main */}
        <main className="flex-1 flex items-center">
          <div className="w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Copy */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05]">
                Measure AI
                <br />
                <span className="text-white/40">collaboration</span>
              </h1>
              <p className="mt-6 text-lg text-white/50 max-w-md leading-relaxed">
                A 10-minute assessment that reveals how effectively candidates work with AI tools.
              </p>
            </div>

            {/* Right - Form */}
            <div className="lg:justify-self-end w-full max-w-sm">
              <form onSubmit={handleStart}>
                <div className="space-y-3">
                  <div 
                    className={`
                      relative rounded-xl transition-all duration-200
                      ${focused ? 'ring-2 ring-white/20' : ''}
                    `}
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="Candidate name"
                      className="w-full bg-white/5 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-black font-medium py-4 rounded-xl hover:bg-white/90 transition-colors"
                  >
                    Start assessment
                  </button>
                </div>
              </form>
              <p className="mt-4 text-sm text-white/30 text-center">
                No account required
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6">
          <div className="flex items-center justify-between text-sm text-white/30">
            <span>© 2026</span>
            <span>Powered by HireUp</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
