"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import type { EmailAction } from "@/lib/assessment-types";

interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  timestamp?: string;
  read?: boolean;
}

interface EmailEnvironmentProps {
  initialInbox?: Email[];
  initialDrafts?: Email[];
}

export interface EmailEnvironmentRef {
  executeAction: (action: EmailAction) => void;
  getState: () => { inbox: Email[]; drafts: Email[]; currentDraft: Email | null };
}

export const EmailEnvironment = forwardRef<EmailEnvironmentRef, EmailEnvironmentProps>(
  function EmailEnvironment({ initialInbox = [], initialDrafts = [] }, ref) {
    const [inbox, setInbox] = useState<Email[]>(initialInbox);
    const [drafts, setDrafts] = useState<Email[]>(initialDrafts);
    const [currentDraft, setCurrentDraft] = useState<Email | null>(null);
    const [view, setView] = useState<"inbox" | "compose" | "read">("inbox");
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

    useImperativeHandle(ref, () => ({
      executeAction: (action: EmailAction) => {
        switch (action.type) {
          case "draft":
            const newDraft: Email = {
              id: Date.now().toString(),
              from: "you@company.com",
              to: action.to || [],
              cc: action.cc,
              subject: action.subject || "",
              body: action.body || "",
            };
            setCurrentDraft(newDraft);
            setView("compose");
            break;
          case "editSubject":
            if (currentDraft && action.subject) {
              setCurrentDraft({ ...currentDraft, subject: action.subject });
            }
            break;
          case "editBody":
            if (currentDraft && action.body) {
              setCurrentDraft({ ...currentDraft, body: action.body });
            }
            break;
          case "addRecipient":
            if (currentDraft && action.to) {
              setCurrentDraft({ ...currentDraft, to: [...currentDraft.to, ...action.to] });
            }
            break;
        }
      },
      getState: () => ({ inbox, drafts, currentDraft }),
    }));

    const handleCompose = () => {
      setCurrentDraft({
        id: Date.now().toString(),
        from: "you@company.com",
        to: [],
        subject: "",
        body: "",
      });
      setView("compose");
    };

    const handleSelectEmail = (email: Email) => {
      setSelectedEmail(email);
      setView("read");
    };

    return (
      <div style={{ display: "flex", height: "100%" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "200px",
            backgroundColor: "#18181b",
            borderRight: "1px solid #27272a",
            padding: "8px",
          }}
        >
          <button
            onClick={handleCompose}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "16px",
            }}
          >
            Compose
          </button>
          <div
            onClick={() => setView("inbox")}
            style={{
              padding: "8px 12px",
              backgroundColor: view === "inbox" ? "#27272a" : "transparent",
              borderRadius: "4px",
              color: "#e4e4e7",
              fontSize: "13px",
              cursor: "pointer",
              marginBottom: "4px",
            }}
          >
            📥 Inbox ({inbox.length})
          </div>
          <div
            style={{
              padding: "8px 12px",
              color: "#71717a",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            📤 Sent
          </div>
          <div
            style={{
              padding: "8px 12px",
              color: "#71717a",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            📝 Drafts ({drafts.length})
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {view === "inbox" && (
            <div style={{ flex: 1, overflow: "auto" }}>
              {inbox.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#52525b",
                    fontSize: "14px",
                  }}
                >
                  No emails in inbox
                </div>
              ) : (
                inbox.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #27272a",
                      cursor: "pointer",
                      backgroundColor: email.read ? "transparent" : "#1a1a2e",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#e4e4e7" }}>
                        {email.from}
                      </span>
                      <span style={{ fontSize: "11px", color: "#52525b" }}>{email.timestamp}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#a1a1aa", marginBottom: "4px" }}>
                      {email.subject}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#71717a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {email.body.slice(0, 100)}...
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {view === "compose" && currentDraft && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px" }}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "#71717a", marginBottom: "4px", display: "block" }}>
                  To
                </label>
                <input
                  type="text"
                  value={currentDraft.to.join(", ")}
                  onChange={(e) =>
                    setCurrentDraft({ ...currentDraft, to: e.target.value.split(",").map((s) => s.trim()) })
                  }
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "#71717a", marginBottom: "4px", display: "block" }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={currentDraft.subject}
                  onChange={(e) => setCurrentDraft({ ...currentDraft, subject: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={currentDraft.body}
                  onChange={(e) => setCurrentDraft({ ...currentDraft, body: e.target.value })}
                  placeholder="Write your email..."
                  style={{
                    ...inputStyle,
                    height: "100%",
                    resize: "none",
                    lineHeight: 1.6,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Send
                </button>
                <button
                  onClick={() => {
                    setDrafts([...drafts, currentDraft]);
                    setView("inbox");
                  }}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "transparent",
                    color: "#71717a",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Save draft
                </button>
              </div>
            </div>
          )}

          {view === "read" && selectedEmail && (
            <div style={{ flex: 1, padding: "24px", overflow: "auto" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "16px" }}>
                {selectedEmail.subject}
              </h2>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#27272a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    fontSize: "16px",
                  }}
                >
                  {selectedEmail.from[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#e4e4e7" }}>
                    {selectedEmail.from}
                  </div>
                  <div style={{ fontSize: "12px", color: "#71717a" }}>to me</div>
                </div>
              </div>
              <div style={{ fontSize: "14px", color: "#d4d4d8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {selectedEmail.body}
              </div>
              <div style={{ marginTop: "24px" }}>
                <button
                  onClick={() => {
                    setCurrentDraft({
                      id: Date.now().toString(),
                      from: "you@company.com",
                      to: [selectedEmail.from],
                      subject: `Re: ${selectedEmail.subject}`,
                      body: "",
                    });
                    setView("compose");
                  }}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#27272a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "6px",
  padding: "10px 12px",
  fontSize: "14px",
  color: "#fff",
  outline: "none",
};
