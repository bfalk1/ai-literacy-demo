"use client";

import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import type { DocumentAction } from "@/lib/assessment-types";

interface DocumentEnvironmentProps {
  initialContent?: string;
  initialTitle?: string;
}

export interface DocumentEnvironmentRef {
  executeAction: (action: DocumentAction) => void;
  getState: () => { title: string; content: string };
}

export const DocumentEnvironment = forwardRef<DocumentEnvironmentRef, DocumentEnvironmentProps>(
  function DocumentEnvironment({ initialContent = "", initialTitle = "Untitled" }, ref) {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      executeAction: (action: DocumentAction) => {
        switch (action.type) {
          case "insertText":
            if (action.text) {
              const pos = action.position ?? content.length;
              setContent((prev) => prev.slice(0, pos) + action.text + prev.slice(pos));
            }
            break;
          case "replaceText":
            if (action.text !== undefined) {
              setContent(action.text);
            }
            break;
          case "deleteText":
            if (action.position !== undefined) {
              // Delete from position to end by default, or implement range
              setContent((prev) => prev.slice(0, action.position));
            }
            break;
          case "highlight":
            if (action.position !== undefined) {
              setHighlightRange({ start: action.position, end: action.position + 50 });
              setTimeout(() => setHighlightRange(null), 3000);
            }
            break;
          case "addComment":
            // TODO: implement comments panel
            console.log("Comment:", action.comment);
            break;
        }
      },
      getState: () => ({ title, content }),
    }));

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0a0a0a" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            borderBottom: "1px solid #27272a",
            gap: "8px",
          }}
        >
          <button style={toolbarButtonStyle}>B</button>
          <button style={toolbarButtonStyle}>I</button>
          <button style={toolbarButtonStyle}>U</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#27272a" }} />
          <button style={toolbarButtonStyle}>H1</button>
          <button style={toolbarButtonStyle}>H2</button>
          <button style={toolbarButtonStyle}>H3</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#27272a" }} />
          <button style={toolbarButtonStyle}>•</button>
          <button style={toolbarButtonStyle}>1.</button>
        </div>

        {/* Title */}
        <div style={{ padding: "24px 48px 0" }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              fontSize: "32px",
              fontWeight: 700,
              color: "#fff",
              outline: "none",
            }}
          />
        </div>

        {/* Content */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setContent(e.currentTarget.textContent || "")}
          style={{
            flex: 1,
            padding: "24px 48px",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "#d4d4d8",
            outline: "none",
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </div>

        {/* Word count */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #27272a",
            fontSize: "11px",
            color: "#52525b",
          }}
        >
          {content.split(/\s+/).filter(Boolean).length} words · {content.length} characters
        </div>
      </div>
    );
  }
);

const toolbarButtonStyle: React.CSSProperties = {
  padding: "4px 8px",
  backgroundColor: "transparent",
  border: "1px solid #27272a",
  borderRadius: "4px",
  color: "#71717a",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};
