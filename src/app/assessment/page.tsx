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
              m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m
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
    localStorage.setItem("assessmentData", JSON.stringify({ messages, duration, task: TASK }));
    router.push("/results");
  };

  const userCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="h-screen bg-[#000] flex flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8">
          {/* Task */}
          {messages.length === 0 && (
            <div className="mb-12">
              <p className="text-[13px] text-white/40 mb-3">Your task</p>
              <p className="text-[15px] text-white/80 leading-relaxed">{TASK}</p>
            </div>
          )}

          {/* Messages */}
          {messages.map((m) => (
            <div key={m.id} className="mb-6">
              <p className="text-[13px] text-white/40 mb-2">
                {m.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="text-[15px] text-white/90 leading-relaxed whitespace-pre-wrap">
                {m.content}
              </p>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="mb-6">
              <p className="text-[13px] text-white/40 mb-2">Assistant</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.04] bg-[#000]">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-[#0f0f0f] border border-white/[0.08] rounded-lg overflow-hidden focus-within:border-white/20 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  rows={1}
                  className="w-full bg-transparent text-[15px] text-white placeholder-white/25 resize-none px-4 py-3 focus:outline-none leading-normal"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-white text-black text-[14px] font-medium rounded-lg hover:bg-white/90 disabled:opacity-30 transition-all"
              >
                Send
              </button>
            </div>
          </form>

          <div className="flex items-center justify-between mt-3">
            <p className="text-[13px] text-white/30">{userCount} messages</p>
            {messages.length >= 2 && (
              <button
                onClick={handleComplete}
                className="text-[13px] text-white/50 hover:text-white/70 transition-colors"
              >
                Finish assessment →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
