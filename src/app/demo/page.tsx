"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ASSESSMENT_TYPES, getIndustries } from "@/lib/assessment-types";

export default function DemoPage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const industries = getIndustries();
  const filteredAssessments = selectedIndustry
    ? ASSESSMENT_TYPES.filter((a) => a.industry === selectedIndustry)
    : ASSESSMENT_TYPES;

  const handleSelectAssessment = (typeId: string) => {
    // Set demo mode - skip validation
    localStorage.setItem("invitationToken", "demo");
    localStorage.setItem("candidateName", "Demo User");
    localStorage.setItem("candidateEmail", "demo@example.com");
    localStorage.setItem("companyId", "demo");
    localStorage.setItem("assessmentType", typeId);
    
    router.push(`/assessment/${typeId}`);
  };

  return (
    <div style={{
      minHeight: "100dvh",
      backgroundColor: "#000",
      color: "#fff",
    }}>
      <header style={{ padding: "20px", borderBottom: "1px solid #27272a" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a" }}>
            TELESCOPIC
          </span>
          <span style={{ 
            fontSize: "10px", 
            padding: "4px 8px", 
            backgroundColor: "#f59e0b", 
            color: "#000",
            borderRadius: "4px",
            fontWeight: 600,
          }}>
            DEMO MODE
          </span>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "8px" }}>
          Assessment Environments
        </h1>
        <p style={{ fontSize: "16px", color: "#71717a", marginBottom: "40px", maxWidth: "600px" }}>
          Explore all available assessment types. Each environment is designed to test real-world skills with AI collaboration.
        </p>

        {/* Industry filter */}
        <div style={{ marginBottom: "32px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedIndustry(null)}
            style={{
              padding: "10px 20px",
              backgroundColor: !selectedIndustry ? "#fff" : "transparent",
              color: !selectedIndustry ? "#000" : "#71717a",
              border: "1px solid #27272a",
              borderRadius: "24px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            All Industries
          </button>
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              style={{
                padding: "10px 20px",
                backgroundColor: selectedIndustry === industry ? "#fff" : "transparent",
                color: selectedIndustry === industry ? "#000" : "#71717a",
                border: "1px solid #27272a",
                borderRadius: "24px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {industry}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ 
          display: "flex", 
          gap: "32px", 
          marginBottom: "32px",
          padding: "20px",
          backgroundColor: "#18181b",
          borderRadius: "12px",
        }}>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>{filteredAssessments.length}</div>
            <div style={{ fontSize: "12px", color: "#71717a" }}>Assessments</div>
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>{industries.length}</div>
            <div style={{ fontSize: "12px", color: "#71717a" }}>Industries</div>
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>10</div>
            <div style={{ fontSize: "12px", color: "#71717a" }}>Environment Types</div>
          </div>
        </div>

        {/* Assessment grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {filteredAssessments.map((assessment) => (
            <button
              key={assessment.id}
              onClick={() => handleSelectAssessment(assessment.id)}
              style={{
                padding: "28px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "16px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#27272a";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                <span style={{ 
                  fontSize: "32px", 
                  width: "56px", 
                  height: "56px", 
                  backgroundColor: "#27272a",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {assessment.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "17px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                    {assessment.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#71717a" }}>
                    {assessment.industry}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.6, margin: "0 0 16px 0" }}>
                {assessment.description}
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  backgroundColor: "#27272a",
                  borderRadius: "6px",
                  color: "#a1a1aa",
                  textTransform: "capitalize",
                }}>
                  {assessment.environment.replace("-", " ")}
                </span>
                <span style={{ fontSize: "12px", color: "#3b82f6" }}>
                  Try it →
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
