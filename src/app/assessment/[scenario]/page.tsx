"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const scenarioData: Record<string, { title: string; systemPrompt: string; task: string; icon: string }> = {
  legal: {
    title: "Legal Assistant",
    icon: "⚖️",
    task: "Draft a cease & desist letter for TechStart Inc. regarding their use of a logo that's confusingly similar to your client's (InnovateCo) registered trademark. The infringing logo appeared on TechStart's website and marketing materials starting 3 months ago.",
    systemPrompt: `You are an AI assistant helping someone complete a legal task. You should be helpful but also realistic - don't just give them a perfect answer immediately. 

If their prompts are vague, ask clarifying questions. If they give good context, provide better output. Mirror real AI assistant behavior.

The user is being assessed on their ability to:
1. Give clear, specific instructions
2. Provide necessary context
3. Iterate and refine based on your output
4. Catch any issues in your responses

Be helpful but make them work for it. Don't volunteer information they should be asking for.`,
  },
  marketing: {
    title: "Marketing Coordinator",
    icon: "📧",
    task: "Create a 3-email launch sequence for 'FlowSync' - a new project management SaaS tool targeting remote teams. The emails should build anticipation, announce the launch, and follow up with a special offer.",
    systemPrompt: `You are an AI assistant helping someone complete a marketing task. You should be helpful but also realistic - don't just give them a perfect answer immediately.

If their prompts are vague or missing key details (target audience, tone, key features, etc.), ask clarifying questions or produce a generic output that could be improved. If they give good context, provide better output.

The user is being assessed on their ability to:
1. Give clear, specific instructions
2. Provide necessary context (audience, tone, features, timing)
3. Iterate and refine based on your output
4. Spot issues like missing CTAs, unclear value props, etc.

Be helpful but make them work for it. Don't volunteer information they should be asking for.`,
  },
  finance: {
    title: "Financial Analyst",
    icon: "📊",
    task: "Build a quarterly budget projection for a seed-stage startup (CloudMetrics) that just raised $1.5M. They have 5 employees, $8K/month in current revenue, and plan to hire 3 more people this quarter.",
    systemPrompt: `You are an AI assistant helping someone complete a financial analysis task. You should be helpful but also realistic - don't just give them a perfect answer immediately.

If their prompts are vague or missing key assumptions (burn rate, salary ranges, growth projections, etc.), ask clarifying questions or make assumptions that they should validate. If they give good context, provide better output.

The user is being assessed on their ability to:
1. Give clear, specific instructions
2. Provide necessary context and assumptions
3. Iterate and refine based on your output
4. Catch unrealistic assumptions or missing categories

Be helpful but make them work for it. Don't volunteer information they should be asking for.`,
  },
};

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const scenario = scenarioData[params.scenario as string];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Scenario not found</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: scenario.systemPrompt,
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
      
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          assistantMessage.content += chunk;
          setMessages(prev => 
            prev.map(m => m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m)
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const messageCount = messages.length;
    
    console.log("Assessment completed:", {
      scenario: params.scenario,
      messages,
      duration,
      messageCount,
      completedAt: new Date().toISOString(),
    });
    
    setIsComplete(true);
    
    setTimeout(() => {
      router.push(`/results?scenario=${params.scenario}&turns=${messageCount}&time=${duration}`);
    }, 1500);
  };

  const userMessageCount = messages.filter(m => m.role === "user").length;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{scenario.icon}</span>
            <div>
              <h1 className="text-white font-semibold">{scenario.title}</h1>
              <p className="text-slate-400 text-sm">AI Literacy Assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-slate-400 text-sm">
              {userMessageCount} prompts
            </div>
            <button
              onClick={handleComplete}
              disabled={messages.length < 2 || isComplete}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isComplete ? "Submitting..." : "Complete Assessment"}
            </button>
          </div>
        </div>
      </div>

      {/* Task Brief */}
      <div className="bg-blue-500/10 border-b border-blue-500/20 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">📋</div>
            <div>
              <p className="text-blue-400 text-sm font-medium mb-1">Your Task</p>
              <p className="text-slate-300 text-sm">{scenario.task}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-500 mb-2">Start chatting with the AI to complete your task</div>
              <div className="text-slate-600 text-sm">Tip: Be specific and provide context for better results</div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-200 border border-slate-700"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isLoading || isComplete}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || isComplete}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
