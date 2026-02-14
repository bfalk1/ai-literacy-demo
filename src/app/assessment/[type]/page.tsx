"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, use } from "react";
import {
  getAssessmentType,
  type EnvironmentType,
  type EnvironmentAction,
} from "@/lib/assessment-types";
import {
  CodeEnvironment,
  SpreadsheetEnvironment,
  DocumentEnvironment,
  SlidesEnvironment,
  EmailEnvironment,
  DatabaseEnvironment,
  CanvasEnvironment,
  CRMEnvironment,
  ProjectBoardEnvironment,
  FormBuilderEnvironment,
  EnvironmentWrapper,
} from "@/components/environments";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: EnvironmentAction[];
}

// Generic environment ref type
interface EnvironmentRef {
  executeAction: (action: EnvironmentAction) => void;
  getState: () => Record<string, unknown>;
}

export default function AssessmentPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const environmentRef = useRef<EnvironmentRef | null>(null);

  const [startTime] = useState(Date.now());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [showTask, setShowTask] = useState(true);

  const assessmentType = getAssessmentType(type);

  useEffect(() => {
    const token = localStorage.getItem("invitationToken");
    const candidateName = localStorage.getItem("candidateName");
    
    if (!token || !candidateName) {
      router.push("/");
      return;
    }
    
    setAuthorized(true);
  }, [router]);

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
    if (!input.trim() || isLoading || !assessmentType) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowTask(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: assessmentType.systemPrompt,
          environmentType: assessmentType.environment,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullContent += chunk;
          assistantMessage.content = fullContent;
          setMessages((prev) => prev.map((m) => m.id === assistantMessage.id ? { ...m, content: fullContent } : m));
        }

        // Parse any environment actions from the response
        const actionMatch = fullContent.match(/```actions\n([\s\S]*?)\n```/);
        if (actionMatch) {
          try {
            const actions = JSON.parse(actionMatch[1]);
            if (Array.isArray(actions) && environmentRef.current) {
              actions.forEach((action: EnvironmentAction) => {
                environmentRef.current?.executeAction(action);
              });
            }
          } catch (e) {
            console.error("Failed to parse actions:", e);
          }
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
      task: assessmentType?.taskTemplate,
      type: assessmentType?.id,
    }));
    router.push("/results");
  };

  const renderEnvironment = (envType: EnvironmentType) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setRef = (r: any) => { environmentRef.current = r; };
    
    switch (envType) {
      case "code":
        return <CodeEnvironment ref={setRef} initialFiles={assessmentType?.initialState?.files as Record<string, string>} />;
      case "spreadsheet":
        return <SpreadsheetEnvironment ref={setRef} />;
      case "document":
        return <DocumentEnvironment ref={setRef} />;
      case "slides":
        return <SlidesEnvironment ref={setRef} />;
      case "email":
        return <EmailEnvironment ref={setRef} />;
      case "database":
        return <DatabaseEnvironment ref={setRef} initialSchema={assessmentType?.initialState?.schema as Record<string, string[]>} />;
      case "canvas":
        return <CanvasEnvironment ref={setRef} />;
      case "crm":
        return <CRMEnvironment ref={setRef} />;
      case "project-board":
        return <ProjectBoardEnvironment ref={setRef} />;
      case "form-builder":
        return <FormBuilderEnvironment ref={setRef} />;
      default:
        return <div style={{ padding: "24px", color: "#71717a" }}>Environment not found</div>;
    }
  };

  if (!authorized || !assessmentType) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#71717a" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      height: "100dvh",
      backgroundColor: "#000",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <header style={{ 
        flexShrink: 0, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid #27272a",
        minHeight: "56px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a" }}>
            TELESCOPIC
          </span>
          <span style={{ fontSize: "13px", color: "#a1a1aa" }}>
            {assessmentType.icon} {assessmentType.name}
          </span>
        </div>
        {messages.length >= 2 && (
          <button
            onClick={handleComplete}
            style={{
              fontSize: "13px",
              fontWeight: 600,
              padding: "8px 16px",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Finish
          </button>
        )}
      </header>

      {/* Main split view */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Chat panel */}
        <div style={{ 
          width: "400px", 
          minWidth: "320px",
          display: "flex", 
          flexDirection: "column",
          borderRight: "1px solid #27272a",
        }}>
          {/* Messages */}
          <main style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "20px",
            WebkitOverflowScrolling: "touch",
          }}>
            {/* Task */}
            {showTask && (
              <div style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
              }}>
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a", marginBottom: "8px" }}>
                  TASK
                </p>
                <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#a1a1aa", margin: 0 }}>
                  {assessmentType.taskTemplate}
                </p>
              </div>
            )}

            {/* Chat */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {messages.map((m) => (
                <div key={m.id}>
                  <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a", marginBottom: "6px" }}>
                    {m.role === "user" ? "YOU" : "AI"}
                  </p>
                  <p style={{ 
                    fontSize: "14px", 
                    lineHeight: 1.7, 
                    whiteSpace: "pre-wrap",
                    color: m.role === "user" ? "#e4e4e7" : "#a1a1aa",
                    margin: 0,
                    wordBreak: "break-word",
                  }}>
                    {m.content.replace(/```actions\n[\s\S]*?\n```/g, "").trim()}
                  </p>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div>
                  <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a", marginBottom: "6px" }}>
                    AI
                  </p>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <span style={{ width: "6px", height: "6px", backgroundColor: "#71717a", borderRadius: "50%", animation: "pulse 1s infinite" }} />
                    <span style={{ width: "6px", height: "6px", backgroundColor: "#71717a", borderRadius: "50%", animation: "pulse 1s infinite 0.15s" }} />
                    <span style={{ width: "6px", height: "6px", backgroundColor: "#71717a", borderRadius: "50%", animation: "pulse 1s infinite 0.3s" }} />
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </main>

          {/* Input */}
          <footer style={{ 
            flexShrink: 0, 
            borderTop: "1px solid #27272a",
            padding: "12px 20px",
            paddingBottom: "max(12px, env(safe-area-inset-bottom))",
            backgroundColor: "#000",
          }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ 
                flex: 1, 
                backgroundColor: "#18181b", 
                borderRadius: "12px",
                border: "1px solid #27272a",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  rows={1}
                  style={{
                    width: "100%",
                    backgroundColor: "transparent",
                    border: "none",
                    padding: "14px 16px",
                    fontSize: "16px",
                    color: "#fff",
                    resize: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.4,
                  }}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  padding: "14px 18px",
                  backgroundColor: "#fff",
                  color: "#000",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  opacity: (isLoading || !input.trim()) ? 0.3 : 1,
                  flexShrink: 0,
                }}
              >
                Send
              </button>
            </form>
          </footer>
        </div>

        {/* Environment panel */}
        <EnvironmentWrapper type={assessmentType.environment}>
          {renderEnvironment(assessmentType.environment)}
        </EnvironmentWrapper>
      </div>
    </div>
  );
}
