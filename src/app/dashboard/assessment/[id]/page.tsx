"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES } from "@/lib/assessment-types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Assessment {
  id: string;
  created_at: string;
  candidate_name: string;
  candidate_email: string | null;
  task: string;
  duration_seconds: number;
  message_count: number;
  overall_score: number;
  prompt_quality_score: number;
  prompt_quality_feedback: string;
  context_score: number;
  context_feedback: string;
  iteration_score: number;
  iteration_feedback: string;
  efficiency_score: number;
  efficiency_feedback: string;
  summary: string;
  transcript: Message[];
  assessment_type?: string;
}

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessment();
  }, [id]);

  const loadAssessment = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Database not configured");
      setLoading(false);
      return;
    }

    // Verify user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Fetch assessment
    const { data, error: fetchError } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !data) {
      setError("Assessment not found");
      setLoading(false);
      return;
    }

    setAssessment(data);
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const assessmentType = assessment?.assessment_type 
    ? ASSESSMENT_TYPES.find(t => t.id === assessment.assessment_type)
    : null;

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#71717a" }}>Loading...</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: "16px" }}>{error || "Assessment not found"}</p>
          <Link href="/dashboard" style={{ color: "#a1a1aa", fontSize: "14px" }}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Prompt Quality", score: assessment.prompt_quality_score, feedback: assessment.prompt_quality_feedback },
    { label: "Context Provided", score: assessment.context_score, feedback: assessment.context_feedback },
    { label: "Iteration", score: assessment.iteration_score, feedback: assessment.iteration_feedback },
    { label: "Efficiency", score: assessment.efficiency_score, feedback: assessment.efficiency_feedback },
  ];

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#000", color: "#fff" }}>
      {/* Header */}
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/dashboard" style={{ color: "#71717a", fontSize: "14px", textDecoration: "none" }}>
            ← Back
          </Link>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a" }}>
            TELESCOPIC
          </span>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px" }}>
        {/* Candidate Info & Score */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "8px" }}>{assessment.candidate_name}</h1>
            <p style={{ fontSize: "14px", color: "#71717a", marginBottom: "4px" }}>{assessment.candidate_email}</p>
            <p style={{ fontSize: "13px", color: "#52525b" }}>
              {formatDate(assessment.created_at)} · {formatTime(assessment.duration_seconds)} · {Math.ceil(assessment.message_count / 2)} prompts
            </p>
            {assessmentType && (
              <p style={{ fontSize: "13px", color: "#71717a", marginTop: "8px" }}>
                {assessmentType.icon} {assessmentType.name}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "48px", fontWeight: 700, color: getScoreColor(assessment.overall_score) }}>
              {assessment.overall_score}
            </div>
            <p style={{ fontSize: "14px", color: "#71717a" }}>Overall Score</p>
          </div>
        </div>

        {/* Task */}
        <div style={{ backgroundColor: "#18181b", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a", marginBottom: "8px" }}>
            TASK
          </p>
          <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>{assessment.task}</p>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left: Metrics & Summary */}
          <div>
            {/* Metrics */}
            <div style={{ backgroundColor: "#18181b", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a", marginBottom: "16px" }}>
                SCORING BREAKDOWN
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {metrics.map((m) => (
                  <div key={m.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", color: "#e4e4e7" }}>{m.label}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: getScoreColor(m.score) }}>{m.score}</span>
                    </div>
                    <div style={{ height: "4px", backgroundColor: "#27272a", borderRadius: "2px", marginBottom: "8px" }}>
                      <div style={{ height: "100%", backgroundColor: getScoreColor(m.score), borderRadius: "2px", width: `${m.score}%` }} />
                    </div>
                    <p style={{ fontSize: "12px", color: "#71717a", lineHeight: 1.5, margin: 0 }}>{m.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ backgroundColor: "#18181b", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a", marginBottom: "12px" }}>
                AI SUMMARY
              </p>
              <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>{assessment.summary}</p>
            </div>
          </div>

          {/* Right: Conversation */}
          <div style={{ backgroundColor: "#18181b", borderRadius: "12px", padding: "20px", maxHeight: "700px", overflowY: "auto" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a", marginBottom: "16px" }}>
              CONVERSATION TRANSCRIPT
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {assessment.transcript && assessment.transcript.map((msg, i) => (
                <div key={i}>
                  <p style={{ 
                    fontSize: "10px", 
                    fontWeight: 600, 
                    letterSpacing: "0.05em", 
                    color: msg.role === "user" ? "#3b82f6" : "#71717a", 
                    marginBottom: "6px" 
                  }}>
                    {msg.role === "user" ? "CANDIDATE" : "AI"}
                  </p>
                  <p style={{ 
                    fontSize: "13px", 
                    color: msg.role === "user" ? "#e4e4e7" : "#a1a1aa", 
                    lineHeight: 1.6, 
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}>
                    {msg.content.replace(/```actions\n[\s\S]*?\n```/g, "").trim()}
                  </p>
                </div>
              ))}
              {(!assessment.transcript || assessment.transcript.length === 0) && (
                <p style={{ color: "#52525b", fontSize: "13px" }}>No transcript available</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
