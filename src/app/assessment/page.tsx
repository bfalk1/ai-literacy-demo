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
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#000', color: '#fff' }}>
      {/* Header */}
      <header style={{ 
        flexShrink: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
          TELESCOPIC
        </div>
        {messages.length >= 2 && (
          <button
            onClick={handleComplete}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '8px 16px',
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Finish
          </button>
        )}
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        {/* Task */}
        {messages.length === 0 && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              TASK
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              {TASK}
            </p>
          </div>
        )}

        {/* Chat messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {messages.map((m) => (
            <div key={m.id}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                {m.role === "user" ? "YOU" : "AI"}
              </div>
              <div style={{ 
                fontSize: '14px', 
                lineHeight: 1.7, 
                whiteSpace: 'pre-wrap',
                color: m.role === "user" ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)'
              }}>
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                AI
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%', animation: 'pulse 1s infinite', animationDelay: '150ms' }} />
                <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%', animation: 'pulse 1s infinite', animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ 
        flexShrink: 0, 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 20px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ 
            flex: 1, 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#fff',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: '#fff',
              color: '#000',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              opacity: (isLoading || !input.trim()) ? 0.3 : 1
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
