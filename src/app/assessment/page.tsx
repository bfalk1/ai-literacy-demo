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
      inputRef.current.style.height = "24px";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage.content += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: assistantMessage.content }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
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
    const duration = Math.round((Date.now() - startTime) / 1000);
    const data = { messages, duration, task: TASK };
    localStorage.setItem("assessmentData", JSON.stringify(data));
    router.push("/results");
  };

  return (
    <div className="h-screen bg-[#000] flex flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Task */}
          {messages.length === 0 && (
            <div className="px-5 pt-16 pb-8">
              <div className="text-[13px] font-medium text-white/40 uppercase tracking-wide mb-3">Task</div>
              <p className="text-[15px] text-white/80 leading-relaxed">{TASK}</p>
            </div>
          )}

          {/* Chat */}
          <div className="px-5 pb-32">
            {messages.map((m, i) => (
              <div
                key={m.id}
                className={`py-5 ${i !== 0 ? "border-t border-white/[0.04]" : ""}`}
              >
                <div className="text-[11px] font-medium text-white/30 uppercase tracking-wide mb-2">
                  {m.role === "user" ? "You" : "Assistant"}
                </div>
                <div className="text-[15px] text-white/85 leading-[1.7] whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="py-5 border-t border-white/[0.04]">
                <div className="text-[11px] font-medium text-white/30 uppercase tracking-wide mb-2">
                  Assistant
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-5 px-5">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-[#0f0f0f] border border-white/[0.08] rounded-xl flex items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                rows={1}
                className="flex-1 bg-transparent text-[15px] text-white placeholder-white/25 resize-none py-3 px-4 focus:outline-none leading-normal"
                disabled={isLoading}
              />
              <div className="flex items-center gap-1 p-2">
                {messages.length >= 2 && (
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="px-3 py-1.5 text-[13px] font-medium text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    Done
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-lg disabled:opacity-20 transition-opacity"
                >
                  <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[11px] text-white/20">
              {messages.filter(m => m.role === "user").length} messages
            </span>
            <span className="text-[11px] text-white/20">
              ↵ send · ⇧↵ newline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
