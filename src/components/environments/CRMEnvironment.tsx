"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import type { CRMAction } from "@/lib/assessment-types";

type RecordType = "contact" | "company" | "deal" | "ticket";

interface CRMRecord {
  id: string;
  type: RecordType;
  name: string;
  email?: string;
  company?: string;
  stage?: string;
  value?: number;
  notes?: string[];
  activities?: Array<{ type: string; date: string; note: string }>;
  createdAt: string;
}

interface CRMEnvironmentProps {
  initialRecords?: CRMRecord[];
}

export interface CRMEnvironmentRef {
  executeAction: (action: CRMAction) => void;
  getState: () => { records: CRMRecord[]; currentRecord: CRMRecord | null };
}

export const CRMEnvironment = forwardRef<CRMEnvironmentRef, CRMEnvironmentProps>(
  function CRMEnvironment({ initialRecords = [] }, ref) {
    const [records, setRecords] = useState<CRMRecord[]>(initialRecords);
    const [currentRecord, setCurrentRecord] = useState<CRMRecord | null>(null);
    const [activeTab, setActiveTab] = useState<RecordType>("contact");
    const [newNote, setNewNote] = useState("");

    useImperativeHandle(ref, () => ({
      executeAction: (action: CRMAction) => {
        switch (action.type) {
          case "createRecord":
            if (action.recordType && action.fields) {
              const newRecord: CRMRecord = {
                id: Date.now().toString(),
                type: action.recordType,
                name: (action.fields.name as string) || "New Record",
                email: action.fields.email as string,
                company: action.fields.company as string,
                stage: action.fields.stage as string,
                value: action.fields.value as number,
                notes: [],
                activities: [],
                createdAt: new Date().toISOString(),
              };
              setRecords((prev) => [...prev, newRecord]);
            }
            break;
          case "updateRecord":
            if (action.recordId && action.fields) {
              setRecords((prev) =>
                prev.map((r) =>
                  r.id === action.recordId ? { ...r, ...action.fields } : r
                )
              );
            }
            break;
          case "addNote":
            if (action.recordId && action.note) {
              setRecords((prev) =>
                prev.map((r) =>
                  r.id === action.recordId
                    ? { ...r, notes: [...(r.notes || []), action.note!] }
                    : r
                )
              );
            }
            break;
          case "logActivity":
            if (action.recordId) {
              setRecords((prev) =>
                prev.map((r) =>
                  r.id === action.recordId
                    ? {
                        ...r,
                        activities: [
                          ...(r.activities || []),
                          { type: "activity", date: new Date().toISOString(), note: action.note || "" },
                        ],
                      }
                    : r
                )
              );
            }
            break;
          case "updateStage":
            if (action.recordId && action.fields?.stage) {
              setRecords((prev) =>
                prev.map((r) =>
                  r.id === action.recordId ? { ...r, stage: action.fields!.stage as string } : r
                )
              );
            }
            break;
        }
      },
      getState: () => ({ records, currentRecord }),
    }));

    const filteredRecords = records.filter((r) => r.type === activeTab);

    const handleAddNote = () => {
      if (currentRecord && newNote.trim()) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === currentRecord.id ? { ...r, notes: [...(r.notes || []), newNote] } : r
          )
        );
        setCurrentRecord((prev) =>
          prev ? { ...prev, notes: [...(prev.notes || []), newNote] } : null
        );
        setNewNote("");
      }
    };

    return (
      <div style={{ display: "flex", height: "100%" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "280px",
            backgroundColor: "#18181b",
            borderRight: "1px solid #27272a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #27272a",
            }}
          >
            {(["contact", "company", "deal", "ticket"] as RecordType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: activeTab === type ? "#27272a" : "transparent",
                  border: "none",
                  color: activeTab === type ? "#fff" : "#71717a",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
              >
                {type}s
              </button>
            ))}
          </div>

          {/* Record list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => setCurrentRecord(record)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #27272a",
                  cursor: "pointer",
                  backgroundColor: currentRecord?.id === record.id ? "#27272a" : "transparent",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#e4e4e7" }}>
                  {record.name}
                </div>
                {record.email && (
                  <div style={{ fontSize: "12px", color: "#71717a" }}>{record.email}</div>
                )}
                {record.stage && (
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      borderRadius: "4px",
                      marginTop: "4px",
                      display: "inline-block",
                    }}
                  >
                    {record.stage}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={() => {
              const newRecord: CRMRecord = {
                id: Date.now().toString(),
                type: activeTab,
                name: `New ${activeTab}`,
                notes: [],
                activities: [],
                createdAt: new Date().toISOString(),
              };
              setRecords([...records, newRecord]);
              setCurrentRecord(newRecord);
            }}
            style={{
              margin: "8px",
              padding: "10px",
              backgroundColor: "#3b82f6",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add {activeTab}
          </button>
        </div>

        {/* Detail view */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {currentRecord ? (
            <>
              {/* Header */}
              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid #27272a",
                }}
              >
                <input
                  type="text"
                  value={currentRecord.name}
                  onChange={(e) => {
                    const updated = { ...currentRecord, name: e.target.value };
                    setCurrentRecord(updated);
                    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#fff",
                    outline: "none",
                    width: "100%",
                  }}
                />
                {currentRecord.type === "deal" && currentRecord.value && (
                  <div style={{ fontSize: "16px", color: "#22c55e", marginTop: "4px" }}>
                    ${currentRecord.value.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Fields */}
              <div style={{ padding: "20px", borderBottom: "1px solid #27272a" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#71717a", display: "block", marginBottom: "4px" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentRecord.email || ""}
                      onChange={(e) => {
                        const updated = { ...currentRecord, email: e.target.value };
                        setCurrentRecord(updated);
                        setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                      }}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#71717a", display: "block", marginBottom: "4px" }}>
                      Company
                    </label>
                    <input
                      type="text"
                      value={currentRecord.company || ""}
                      onChange={(e) => {
                        const updated = { ...currentRecord, company: e.target.value };
                        setCurrentRecord(updated);
                        setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                      }}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#e4e4e7", marginBottom: "12px" }}>
                  Notes
                </div>
                {(currentRecord.notes || []).map((note, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px",
                      backgroundColor: "#18181b",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      fontSize: "13px",
                      color: "#a1a1aa",
                    }}
                  >
                    {note}
                  </div>
                ))}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                    placeholder="Add a note..."
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={handleAddNote}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#27272a",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#52525b",
                fontSize: "14px",
              }}
            >
              Select a record to view details
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
  padding: "8px 12px",
  fontSize: "13px",
  color: "#fff",
  outline: "none",
};
