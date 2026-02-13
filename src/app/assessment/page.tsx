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
    <div className="h-[100dvh] bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/10">
        <div className="text-xs font-semibold tracking-widest text-white/40">TELESCOPIC</div>
        {messages.length >= 2 && (
          <button
            onClick={handleComplete}
            className="text-xs font-semibold px-3 py-1.5 bg-white text-black rounded-md"
          >
            Finish
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
          {/* Task */}
          {messages.length === 0 && (
            <div className="rounded-lg bg-white/[0.03] border border-white/10 p-4 mb-6">
              <div className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-2">Task</div>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">{TASK}</p>
            </div>
          )}

          {/* Chat */}
          <div className="space-y-6">
            {messages.map((m) => (
              <div key={m.id}>
                <div className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-2">
                  {m.role === "user" ? "You" : "AI"}
                </div>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "text-white/90" : "text-white/60"}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div>
                <div className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-2">AI</div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 bg-white/5 rounded-lg border border-white/10">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                rows={1}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-white text-black text-xs font-semibold rounded-lg disabled:opacity-30"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
