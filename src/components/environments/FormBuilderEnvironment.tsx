"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import type { FormBuilderAction } from "@/lib/assessment-types";

type FieldType = "text" | "number" | "email" | "select" | "multiselect" | "date" | "file" | "rating" | "textarea";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: Record<string, unknown>;
}

interface FormBuilderEnvironmentProps {
  initialFields?: FormField[];
  initialTitle?: string;
}

export interface FormBuilderEnvironmentRef {
  executeAction: (action: FormBuilderAction) => void;
  getState: () => { title: string; fields: FormField[] };
}

export const FormBuilderEnvironment = forwardRef<FormBuilderEnvironmentRef, FormBuilderEnvironmentProps>(
  function FormBuilderEnvironment({ initialFields = [], initialTitle = "Untitled Form" }, ref) {
    const [title, setTitle] = useState(initialTitle);
    const [fields, setFields] = useState<FormField[]>(initialFields);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [draggedField, setDraggedField] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      executeAction: (action: FormBuilderAction) => {
        switch (action.type) {
          case "addField":
            if (action.fieldType && action.label) {
              const newField: FormField = {
                id: Date.now().toString(),
                type: action.fieldType,
                label: action.label,
                required: action.required,
                options: action.options,
              };
              setFields((prev) => [...prev, newField]);
            }
            break;
          case "editField":
            if (action.fieldId) {
              setFields((prev) =>
                prev.map((f) =>
                  f.id === action.fieldId
                    ? {
                        ...f,
                        label: action.label ?? f.label,
                        required: action.required ?? f.required,
                        options: action.options ?? f.options,
                      }
                    : f
                )
              );
            }
            break;
          case "deleteField":
            if (action.fieldId) {
              setFields((prev) => prev.filter((f) => f.id !== action.fieldId));
            }
            break;
          case "reorderFields":
            // TODO: implement reorder
            break;
        }
      },
      getState: () => ({ title, fields }),
    }));

    const fieldTypes: { type: FieldType; icon: string; label: string }[] = [
      { type: "text", icon: "Aa", label: "Text" },
      { type: "textarea", icon: "¶", label: "Long Text" },
      { type: "number", icon: "#", label: "Number" },
      { type: "email", icon: "@", label: "Email" },
      { type: "select", icon: "▼", label: "Dropdown" },
      { type: "multiselect", icon: "☑", label: "Checkboxes" },
      { type: "date", icon: "📅", label: "Date" },
      { type: "file", icon: "📎", label: "File Upload" },
      { type: "rating", icon: "★", label: "Rating" },
    ];

    const handleAddField = (type: FieldType) => {
      const newField: FormField = {
        id: Date.now().toString(),
        type,
        label: `New ${type} field`,
        required: false,
        options: type === "select" || type === "multiselect" ? ["Option 1", "Option 2"] : undefined,
      };
      setFields([...fields, newField]);
      setSelectedField(newField.id);
    };

    const handleDragStart = (fieldId: string) => {
      setDraggedField(fieldId);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggedField || draggedField === targetId) return;

      const dragIndex = fields.findIndex((f) => f.id === draggedField);
      const targetIndex = fields.findIndex((f) => f.id === targetId);

      if (dragIndex !== -1 && targetIndex !== -1) {
        const newFields = [...fields];
        const [removed] = newFields.splice(dragIndex, 1);
        newFields.splice(targetIndex, 0, removed);
        setFields(newFields);
      }
    };

    const handleDragEnd = () => {
      setDraggedField(null);
    };

    const renderFieldPreview = (field: FormField) => {
      switch (field.type) {
        case "text":
        case "email":
        case "number":
          return (
            <input
              type={field.type}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              disabled
              style={previewInputStyle}
            />
          );
        case "textarea":
          return (
            <textarea
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              disabled
              rows={3}
              style={{ ...previewInputStyle, resize: "none" }}
            />
          );
        case "select":
          return (
            <select disabled style={previewInputStyle}>
              <option>Select an option</option>
              {field.options?.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          );
        case "multiselect":
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {field.options?.map((opt) => (
                <label key={opt} style={{ fontSize: "13px", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="checkbox" disabled /> {opt}
                </label>
              ))}
            </div>
          );
        case "date":
          return <input type="date" disabled style={previewInputStyle} />;
        case "file":
          return (
            <div
              style={{
                padding: "24px",
                border: "2px dashed #27272a",
                borderRadius: "8px",
                textAlign: "center",
                color: "#52525b",
                fontSize: "13px",
              }}
            >
              Drop file or click to upload
            </div>
          );
        case "rating":
          return (
            <div style={{ display: "flex", gap: "4px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} style={{ fontSize: "20px", color: "#52525b" }}>
                  ☆
                </span>
              ))}
            </div>
          );
        default:
          return null;
      }
    };

    const selected = fields.find((f) => f.id === selectedField);

    return (
      <div style={{ display: "flex", height: "100%" }}>
        {/* Field types sidebar */}
        <div
          style={{
            width: "180px",
            backgroundColor: "#18181b",
            borderRight: "1px solid #27272a",
            padding: "12px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#71717a",
              marginBottom: "12px",
            }}
          >
            ADD FIELD
          </div>
          {fieldTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => handleAddField(type)}
              style={{
                width: "100%",
                padding: "8px 12px",
                marginBottom: "4px",
                backgroundColor: "transparent",
                border: "1px solid #27272a",
                borderRadius: "6px",
                color: "#a1a1aa",
                fontSize: "12px",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ width: "20px", textAlign: "center" }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Form preview */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#0a0a0a",
            overflow: "auto",
            padding: "24px",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              backgroundColor: "#18181b",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "24px",
                fontWeight: 700,
                color: "#fff",
                outline: "none",
                marginBottom: "24px",
              }}
            />

            {fields.length === 0 ? (
              <div
                style={{
                  padding: "48px",
                  border: "2px dashed #27272a",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#52525b",
                  fontSize: "14px",
                }}
              >
                Add fields from the sidebar to get started
              </div>
            ) : (
              fields.map((field) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(field.id)}
                  onDragOver={(e) => handleDragOver(e, field.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedField(field.id)}
                  style={{
                    padding: "16px",
                    marginBottom: "12px",
                    backgroundColor: selectedField === field.id ? "#27272a" : "transparent",
                    border: `1px solid ${selectedField === field.id ? "#3b82f6" : "#27272a"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    opacity: draggedField === field.id ? 0.5 : 1,
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#e4e4e7",
                      marginBottom: "8px",
                    }}
                  >
                    {field.label}
                    {field.required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
                  </label>
                  {renderFieldPreview(field)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Properties panel */}
        <div
          style={{
            width: "240px",
            backgroundColor: "#18181b",
            borderLeft: "1px solid #27272a",
            padding: "12px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#71717a",
              marginBottom: "12px",
            }}
          >
            FIELD SETTINGS
          </div>
          {selected ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Label</label>
                <input
                  type="text"
                  value={selected.label}
                  onChange={(e) =>
                    setFields((prev) =>
                      prev.map((f) => (f.id === selected.id ? { ...f, label: e.target.value } : f))
                    )
                  }
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={selected.required || false}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((f) => (f.id === selected.id ? { ...f, required: e.target.checked } : f))
                      )
                    }
                  />
                  Required
                </label>
              </div>
              {(selected.type === "select" || selected.type === "multiselect") && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Options (one per line)</label>
                  <textarea
                    value={selected.options?.join("\n") || ""}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((f) =>
                          f.id === selected.id ? { ...f, options: e.target.value.split("\n") } : f
                        )
                      )
                    }
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              )}
              <button
                onClick={() => {
                  setFields((prev) => prev.filter((f) => f.id !== selected.id));
                  setSelectedField(null);
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#ef4444",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Delete Field
              </button>
            </>
          ) : (
            <div style={{ fontSize: "12px", color: "#52525b" }}>Select a field to edit</div>
          )}
        </div>
      </div>
    );
  }
);

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#71717a",
  display: "block",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0a0a0a",
  border: "1px solid #27272a",
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "13px",
  color: "#fff",
  outline: "none",
};

const previewInputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0a0a0a",
  border: "1px solid #27272a",
  borderRadius: "6px",
  padding: "10px 12px",
  fontSize: "14px",
  color: "#71717a",
  outline: "none",
};
