"use client";

import { useState, useImperativeHandle, forwardRef, useCallback } from "react";
import type { SpreadsheetAction } from "@/lib/assessment-types";

interface CellData {
  value: string | number;
  formula?: string;
  format?: Record<string, unknown>;
}

interface SpreadsheetData {
  [cell: string]: CellData;
}

interface SpreadsheetEnvironmentProps {
  initialData?: SpreadsheetData;
  initialSheets?: string[];
  initialActiveSheet?: string;
  rows?: number;
  cols?: number;
}

export interface SpreadsheetEnvironmentRef {
  executeAction: (action: SpreadsheetAction) => void;
  getState: () => { sheets: Record<string, SpreadsheetData>; activeSheet: string };
}

const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getCellId(col: number, row: number): string {
  return `${COLS[col]}${row + 1}`;
}

export const SpreadsheetEnvironment = forwardRef<SpreadsheetEnvironmentRef, SpreadsheetEnvironmentProps>(
  function SpreadsheetEnvironment(
    { initialData = {}, initialSheets = ["Sheet1"], initialActiveSheet, rows = 50, cols = 26 },
    ref
  ) {
    const [sheets, setSheets] = useState<Record<string, SpreadsheetData>>(() => {
      const initial: Record<string, SpreadsheetData> = {};
      initialSheets.forEach((name, i) => {
        initial[name] = i === 0 ? initialData : {};
      });
      return initial;
    });
    const [activeSheet, setActiveSheet] = useState(initialActiveSheet || initialSheets[0]);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [highlightedCells, setHighlightedCells] = useState<string[]>([]);

    const data = sheets[activeSheet] || {};

    useImperativeHandle(ref, () => ({
      executeAction: (action: SpreadsheetAction) => {
        switch (action.type) {
          case "setCellValue":
            if (action.cell && action.value !== undefined) {
              setSheets((prev) => ({
                ...prev,
                [activeSheet]: {
                  ...prev[activeSheet],
                  [action.cell!]: { value: action.value!, formula: undefined },
                },
              }));
            }
            break;
          case "setCellFormula":
            if (action.cell && action.formula) {
              setSheets((prev) => ({
                ...prev,
                [activeSheet]: {
                  ...prev[activeSheet],
                  [action.cell!]: { value: `[${action.formula}]`, formula: action.formula },
                },
              }));
            }
            break;
          case "formatCell":
            if (action.cell && action.format) {
              setSheets((prev) => ({
                ...prev,
                [activeSheet]: {
                  ...prev[activeSheet],
                  [action.cell!]: {
                    ...prev[activeSheet]?.[action.cell!],
                    value: prev[activeSheet]?.[action.cell!]?.value || "",
                    format: action.format,
                  },
                },
              }));
            }
            break;
          case "highlight":
            if (action.cell || action.range) {
              const cells = action.range ? parseRange(action.range) : [action.cell!];
              setHighlightedCells(cells);
              setTimeout(() => setHighlightedCells([]), 3000);
            }
            break;
        }
      },
      getState: () => ({ sheets, activeSheet }),
    }));

    const parseRange = (range: string): string[] => {
      // Simple A1:B2 parser
      const [start, end] = range.split(":");
      if (!end) return [start];
      // TODO: implement full range parsing
      return [start, end];
    };

    const handleCellClick = (cellId: string) => {
      setSelectedCell(cellId);
    };

    const handleCellDoubleClick = (cellId: string) => {
      setEditingCell(cellId);
    };

    const handleCellChange = (cellId: string, value: string) => {
      setSheets((prev) => ({
        ...prev,
        [activeSheet]: {
          ...prev[activeSheet],
          [cellId]: { value, formula: value.startsWith("=") ? value : undefined },
        },
      }));
    };

    const handleCellBlur = () => {
      setEditingCell(null);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Sheet tabs */}
        <div
          style={{
            display: "flex",
            gap: "1px",
            backgroundColor: "#18181b",
            borderBottom: "1px solid #27272a",
            padding: "0 8px",
          }}
        >
          {Object.keys(sheets).map((name) => (
            <button
              key={name}
              onClick={() => setActiveSheet(name)}
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                backgroundColor: activeSheet === name ? "#27272a" : "transparent",
                color: activeSheet === name ? "#fff" : "#71717a",
                border: "none",
                cursor: "pointer",
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Formula bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
            borderBottom: "1px solid #27272a",
            backgroundColor: "#18181b",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "12px", color: "#71717a", width: "40px" }}>
            {selectedCell || ""}
          </span>
          <input
            type="text"
            value={selectedCell ? (data[selectedCell]?.formula || data[selectedCell]?.value || "") : ""}
            onChange={(e) => selectedCell && handleCellChange(selectedCell, e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "#0a0a0a",
              border: "1px solid #27272a",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "12px",
              color: "#fff",
              outline: "none",
            }}
          />
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "40px",
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    position: "sticky",
                    top: 0,
                    left: 0,
                    zIndex: 2,
                  }}
                />
                {Array.from({ length: cols }, (_, i) => (
                  <th
                    key={i}
                    style={{
                      width: "100px",
                      padding: "4px 8px",
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      color: "#71717a",
                      fontWeight: 500,
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {COLS[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  <td
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      color: "#71717a",
                      textAlign: "center",
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                    }}
                  >
                    {rowIndex + 1}
                  </td>
                  {Array.from({ length: cols }, (_, colIndex) => {
                    const cellId = getCellId(colIndex, rowIndex);
                    const cell = data[cellId];
                    const isSelected = selectedCell === cellId;
                    const isEditing = editingCell === cellId;
                    const isHighlighted = highlightedCells.includes(cellId);

                    return (
                      <td
                        key={cellId}
                        onClick={() => handleCellClick(cellId)}
                        onDoubleClick={() => handleCellDoubleClick(cellId)}
                        style={{
                          padding: 0,
                          border: `1px solid ${isSelected ? "#3b82f6" : "#27272a"}`,
                          backgroundColor: isHighlighted
                            ? "rgba(59, 130, 246, 0.2)"
                            : isSelected
                            ? "#1a1a2e"
                            : "#0a0a0a",
                          outline: isSelected ? "1px solid #3b82f6" : "none",
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={cell?.value ?? ""}
                            onChange={(e) => handleCellChange(cellId, e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={(e) => e.key === "Enter" && handleCellBlur()}
                            style={{
                              width: "100%",
                              height: "100%",
                              padding: "4px 8px",
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#fff",
                              fontSize: "12px",
                              outline: "none",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              padding: "4px 8px",
                              color: cell?.formula ? "#60a5fa" : "#e4e4e7",
                              minHeight: "24px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cell?.value ?? ""}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);
