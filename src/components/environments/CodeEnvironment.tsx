"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import type { CodeAction } from "@/lib/assessment-types";

interface FileSystem {
  [path: string]: string;
}

interface CodeEnvironmentProps {
  initialFiles?: FileSystem;
  initialOpenFile?: string;
}

export interface CodeEnvironmentRef {
  executeAction: (action: CodeAction) => void;
  getState: () => { files: FileSystem; openFile: string; terminalOutput: string[] };
}

export const CodeEnvironment = forwardRef<CodeEnvironmentRef, CodeEnvironmentProps>(
  function CodeEnvironment({ initialFiles = {}, initialOpenFile = "" }, ref) {
    const [files, setFiles] = useState<FileSystem>(initialFiles);
    const [openFile, setOpenFile] = useState(initialOpenFile || Object.keys(initialFiles)[0] || "");
    const [terminalOutput, setTerminalOutput] = useState<string[]>(["$ "]);
    const [highlightLine, setHighlightLine] = useState<number | null>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      executeAction: (action: CodeAction) => {
        switch (action.type) {
          case "writeFile":
            if (action.path && action.content !== undefined) {
              setFiles((prev) => ({ ...prev, [action.path!]: action.content! }));
              setOpenFile(action.path);
            }
            break;
          case "deleteFile":
            if (action.path) {
              setFiles((prev) => {
                const next = { ...prev };
                delete next[action.path!];
                return next;
              });
              if (openFile === action.path) {
                setOpenFile(Object.keys(files).find((f) => f !== action.path) || "");
              }
            }
            break;
          case "runCommand":
            if (action.command) {
              setTerminalOutput((prev) => [
                ...prev,
                `$ ${action.command}`,
                `[simulated] Running: ${action.command}`,
                "$ ",
              ]);
            }
            break;
          case "openFile":
            if (action.path && files[action.path]) {
              setOpenFile(action.path);
            }
            break;
          case "highlight":
            if (action.line) {
              setHighlightLine(action.line);
              setTimeout(() => setHighlightLine(null), 3000);
            }
            break;
        }
      },
      getState: () => ({ files, openFile, terminalOutput }),
    }));

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (openFile) {
        setFiles((prev) => ({ ...prev, [openFile]: e.target.value }));
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* File tabs */}
        <div
          style={{
            display: "flex",
            gap: "1px",
            backgroundColor: "#18181b",
            borderBottom: "1px solid #27272a",
            overflowX: "auto",
          }}
        >
          {Object.keys(files).map((path) => (
            <button
              key={path}
              onClick={() => setOpenFile(path)}
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                backgroundColor: openFile === path ? "#27272a" : "transparent",
                color: openFile === path ? "#fff" : "#71717a",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {path.split("/").pop()}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <textarea
            ref={editorRef}
            value={files[openFile] || ""}
            onChange={handleCodeChange}
            spellCheck={false}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#0a0a0a",
              color: "#e4e4e7",
              border: "none",
              padding: "16px",
              fontSize: "13px",
              fontFamily: "ui-monospace, monospace",
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
            }}
          />
          {highlightLine && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${(highlightLine - 1) * 20.8 + 16}px`,
                height: "20.8px",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Terminal */}
        <div
          style={{
            height: "150px",
            backgroundColor: "#0a0a0a",
            borderTop: "1px solid #27272a",
            overflow: "auto",
            padding: "8px 16px",
            fontFamily: "ui-monospace, monospace",
            fontSize: "12px",
            color: "#a1a1aa",
          }}
        >
          {terminalOutput.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    );
  }
);
