"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const TASK = "Write a professional email to a client explaining that their project will be delayed by 2 weeks due to unexpected technical issues. The email should maintain a good relationship while being honest about the situation.";

const SYSTEM_PROMPT = `You are an AI assistant helping someone write a professional email. Be helpful but realistic - don't give perfect output immediately.

If their prompt is vague, produce a generic response that could be improved. If they give good context (client name, project details, tone preferences, etc.), provide better output.

Key behaviors:
- If they just say "write the email" with no context, write something generic and slightly off
- If they provide specifics, incorporate them well
- If they ask you to revise, do so based on their feedback
- Don't volunteer suggestions they should be thinking of themselves

You're helping assess their AI collaboration skills - make them demonstrate good prompting.`;

export default function AssessmentPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [startTime] = useState(Date.now());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantMessage.content += decoder.decode(value);
          setMessages((prev) => prev.map((m) => m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("assessmentData", JSON.stringify({ 
      messages, 
      duration: Math.round((Date.now() - startTime) / 1000), 
      task: TASK 
    }));
    router.push("/results");
  };

  return (
    <div className="h-dvh flex flex-col bg-black text-white">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <span className="text-xs font-semibold tracking-widest text-zinc-500">TELESCOPIC</span>
        {messages.length >= 2 && (
          <button
            onClick={handleComplete}
            className="text-xs font-semibold px-4 py-2 bg-white text-black rounded-lg"
          >
            Finish
          </button>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-5 py-6">
        {/* Task Card */}
        {messages.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
            <p className="text-xs font-semibold tracking-widest text-zinc-500 mb-3">TASK</p>
            <p className="text-sm leading-relaxed text-zinc-300">{TASK}</p>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((m) => (
            <div key={m.id}>
              <p className="text-xs font-semibold tracking-widest text-zinc-500 mb-2">
                {m.role === "user" ? "YOU" : "AI"}
              </p>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "text-zinc-100" : "text-zinc-400"}`}>
                {m.content}
              </p>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-zinc-500 mb-2">AI</p>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse delay-150" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse delay-300" />
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="shrink-0 border-t border-zinc-800 px-5 py-3 pb-safe">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-600 resize-none outline-none"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-white text-black text-sm font-semibold rounded-xl disabled:opacity-30"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
