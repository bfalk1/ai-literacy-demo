"use client";

import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import type { CanvasAction } from "@/lib/assessment-types";

interface CanvasElement {
  id: string;
  type: "rectangle" | "circle" | "text" | "line" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fill?: string;
  stroke?: string;
}

interface Artboard {
  name: string;
  width: number;
  height: number;
}

interface CanvasEnvironmentProps {
  initialElements?: CanvasElement[];
  initialArtboards?: Artboard[];
}

export interface CanvasEnvironmentRef {
  executeAction: (action: CanvasAction) => void;
  getState: () => { elements: CanvasElement[]; artboards: Artboard[] };
}

export const CanvasEnvironment = forwardRef<CanvasEnvironmentRef, CanvasEnvironmentProps>(
  function CanvasEnvironment(
    {
      initialElements = [],
      initialArtboards = [{ name: "Artboard 1", width: 375, height: 812 }],
    },
    ref
  ) {
    const [elements, setElements] = useState<CanvasElement[]>(initialElements);
    const [artboards] = useState<Artboard[]>(initialArtboards);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<"select" | "rectangle" | "circle" | "text">("select");
    const canvasRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      executeAction: (action: CanvasAction) => {
        switch (action.type) {
          case "addShape":
            if (action.shape && action.position) {
              const newElement: CanvasElement = {
                id: Date.now().toString(),
                type: action.shape as CanvasElement["type"],
                x: action.position.x,
                y: action.position.y,
                width: action.size?.width || 100,
                height: action.size?.height || 100,
                fill: "#3b82f6",
              };
              setElements((prev) => [...prev, newElement]);
            }
            break;
          case "addText":
            if (action.content && action.position) {
              const newElement: CanvasElement = {
                id: Date.now().toString(),
                type: "text",
                x: action.position.x,
                y: action.position.y,
                width: 200,
                height: 40,
                content: action.content,
              };
              setElements((prev) => [...prev, newElement]);
            }
            break;
          case "moveElement":
            if (action.elementId && action.position) {
              setElements((prev) =>
                prev.map((el) =>
                  el.id === action.elementId
                    ? { ...el, x: action.position!.x, y: action.position!.y }
                    : el
                )
              );
            }
            break;
          case "resizeElement":
            if (action.elementId && action.size) {
              setElements((prev) =>
                prev.map((el) =>
                  el.id === action.elementId
                    ? { ...el, width: action.size!.width, height: action.size!.height }
                    : el
                )
              );
            }
            break;
          case "deleteElement":
            if (action.elementId) {
              setElements((prev) => prev.filter((el) => el.id !== action.elementId));
            }
            break;
        }
      },
      getState: () => ({ elements, artboards }),
    }));

    const handleCanvasClick = (e: React.MouseEvent) => {
      if (activeTool === "select") {
        setSelectedElement(null);
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: activeTool === "text" ? "text" : activeTool,
        x,
        y,
        width: activeTool === "text" ? 200 : 100,
        height: activeTool === "text" ? 40 : 100,
        fill: activeTool === "text" ? undefined : "#3b82f6",
        content: activeTool === "text" ? "Text" : undefined,
      };

      setElements((prev) => [...prev, newElement]);
      setActiveTool("select");
    };

    const handleElementClick = (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation();
      setSelectedElement(elementId);
    };

    const renderElement = (element: CanvasElement) => {
      const isSelected = selectedElement === element.id;
      const baseStyle: React.CSSProperties = {
        position: "absolute",
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: "move",
        outline: isSelected ? "2px solid #3b82f6" : "none",
        outlineOffset: "2px",
      };

      switch (element.type) {
        case "rectangle":
          return (
            <div
              key={element.id}
              onClick={(e) => handleElementClick(e, element.id)}
              style={{
                ...baseStyle,
                backgroundColor: element.fill,
                borderRadius: "4px",
              }}
            />
          );
        case "circle":
          return (
            <div
              key={element.id}
              onClick={(e) => handleElementClick(e, element.id)}
              style={{
                ...baseStyle,
                backgroundColor: element.fill,
                borderRadius: "50%",
              }}
            />
          );
        case "text":
          return (
            <div
              key={element.id}
              onClick={(e) => handleElementClick(e, element.id)}
              style={{
                ...baseStyle,
                display: "flex",
                alignItems: "center",
                color: "#e4e4e7",
                fontSize: "14px",
              }}
            >
              {element.content}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ display: "flex", height: "100%" }}>
        {/* Toolbar */}
        <div
          style={{
            width: "48px",
            backgroundColor: "#18181b",
            borderRight: "1px solid #27272a",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <ToolButton
            icon="↖"
            active={activeTool === "select"}
            onClick={() => setActiveTool("select")}
            title="Select"
          />
          <ToolButton
            icon="▢"
            active={activeTool === "rectangle"}
            onClick={() => setActiveTool("rectangle")}
            title="Rectangle"
          />
          <ToolButton
            icon="○"
            active={activeTool === "circle"}
            onClick={() => setActiveTool("circle")}
            title="Circle"
          />
          <ToolButton
            icon="T"
            active={activeTool === "text"}
            onClick={() => setActiveTool("text")}
            title="Text"
          />
        </div>

        {/* Canvas area */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#0a0a0a",
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {/* Artboard */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: artboards[0].width,
              height: artboards[0].height,
              backgroundColor: "#1a1a2e",
              borderRadius: "8px",
              position: "relative",
              boxShadow: "0 0 0 1px #27272a",
            }}
          >
            {elements.map(renderElement)}
          </div>
        </div>

        {/* Properties panel */}
        <div
          style={{
            width: "200px",
            backgroundColor: "#18181b",
            borderLeft: "1px solid #27272a",
            padding: "12px",
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
            PROPERTIES
          </div>
          {selectedElement ? (
            <>
              {(() => {
                const el = elements.find((e) => e.id === selectedElement);
                if (!el) return null;
                return (
                  <div style={{ fontSize: "12px", color: "#a1a1aa" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#71717a" }}>Type:</span> {el.type}
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#71717a" }}>Position:</span> {el.x}, {el.y}
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#71717a" }}>Size:</span> {el.width} × {el.height}
                    </div>
                    <button
                      onClick={() => {
                        setElements((prev) => prev.filter((e) => e.id !== selectedElement));
                        setSelectedElement(null);
                      }}
                      style={{
                        marginTop: "12px",
                        padding: "6px 12px",
                        backgroundColor: "#ef4444",
                        border: "none",
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })()}
            </>
          ) : (
            <div style={{ fontSize: "12px", color: "#52525b" }}>Select an element</div>
          )}
        </div>
      </div>
    );
  }
);

function ToolButton({
  icon,
  active,
  onClick,
  title,
}: {
  icon: string;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? "#3b82f6" : "transparent",
        border: "none",
        borderRadius: "4px",
        color: active ? "#fff" : "#71717a",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      {icon}
    </button>
  );
}
