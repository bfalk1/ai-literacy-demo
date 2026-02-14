"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ASSESSMENT_TYPES, getIndustries } from "@/lib/assessment-types";

interface Invitation {
  id: string;
  candidate_email: string;
  candidate_name: string | null;
  company_id: string;
  assessment_type?: string; // If company specified a type
}

export default function SelectAssessmentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const industries = getIndustries();
  const filteredAssessments = selectedIndustry
    ? ASSESSMENT_TYPES.filter((a) => a.industry === selectedIndustry)
    : ASSESSMENT_TYPES;

  useEffect(() => {
    validateAndLoad();
  }, [token]);

  const validateAndLoad = async () => {
    try {
      const response = await fetch(`/api/invitations/validate?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        router.push(`/assess/${token}`);
        return;
      }

      setInvitation(data.invitation);

      // If company specified an assessment type, go directly there
      if (data.invitation.assessment_type) {
        handleSelectAssessment(data.invitation.assessment_type);
        return;
      }
    } catch (err) {
      router.push(`/assess/${token}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssessment = (typeId: string) => {
    // Store the selection
    localStorage.setItem("assessmentType", typeId);
    router.push(`/assessment/${typeId}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#71717a", fontSize: "14px" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100dvh",
      backgroundColor: "#000",
      color: "#fff",
    }}>
      <header style={{ padding: "20px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: "#71717a" }}>
          TELESCOPIC
        </span>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "8px" }}>
          Select Your Assessment
        </h1>
        <p style={{ fontSize: "14px", color: "#71717a", marginBottom: "32px" }}>
          Choose the assessment that best matches your role.
        </p>

        {/* Industry filter */}
        <div style={{ marginBottom: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedIndustry(null)}
            style={{
              padding: "8px 16px",
              backgroundColor: !selectedIndustry ? "#fff" : "transparent",
              color: !selectedIndustry ? "#000" : "#71717a",
              border: "1px solid #27272a",
              borderRadius: "20px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            All
          </button>
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              style={{
                padding: "8px 16px",
                backgroundColor: selectedIndustry === industry ? "#fff" : "transparent",
                color: selectedIndustry === industry ? "#000" : "#71717a",
                border: "1px solid #27272a",
                borderRadius: "20px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {industry}
            </button>
          ))}
        </div>

        {/* Assessment grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}>
          {filteredAssessments.map((assessment) => (
            <button
              key={assessment.id}
              onClick={() => handleSelectAssessment(assessment.id)}
              style={{
                padding: "24px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#27272a"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>{assessment.icon}</span>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#e4e4e7" }}>
                    {assessment.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#71717a" }}>
                    {assessment.industry}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.5, margin: 0 }}>
                {assessment.description}
              </p>
              <div style={{ marginTop: "12px" }}>
                <span style={{
                  fontSize: "10px",
                  padding: "4px 8px",
                  backgroundColor: "#27272a",
                  borderRadius: "4px",
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {assessment.environment.replace("-", " ")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
