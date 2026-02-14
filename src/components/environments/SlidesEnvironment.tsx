"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import type { SlidesAction } from "@/lib/assessment-types";

interface Slide {
  id: string;
  title: string;
  content: string;
  elements?: Array<{
    type: "text" | "image" | "shape";
    content?: string;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }>;
}

interface SlidesEnvironmentProps {
  initialSlides?: Slide[];
}

export interface SlidesEnvironmentRef {
  executeAction: (action: SlidesAction) => void;
  getState: () => { slides: Slide[]; activeSlide: number };
}

export const SlidesEnvironment = forwardRef<SlidesEnvironmentRef, SlidesEnvironmentProps>(
  function SlidesEnvironment({ initialSlides }, ref) {
    const [slides, setSlides] = useState<Slide[]>(
      initialSlides || [{ id: "1", title: "Title Slide", content: "" }]
    );
    const [activeSlide, setActiveSlide] = useState(0);

    useImperativeHandle(ref, () => ({
      executeAction: (action: SlidesAction) => {
        switch (action.type) {
          case "addSlide":
            const newSlide: Slide = {
              id: Date.now().toString(),
              title: "New Slide",
              content: "",
            };
            setSlides((prev) => [...prev, newSlide]);
            setActiveSlide(slides.length);
            break;
          case "deleteSlide":
            if (action.slideIndex !== undefined && slides.length > 1) {
              setSlides((prev) => prev.filter((_, i) => i !== action.slideIndex));
              setActiveSlide((prev) => Math.min(prev, slides.length - 2));
            }
            break;
          case "editSlide":
            if (action.slideIndex !== undefined && action.content) {
              setSlides((prev) =>
                prev.map((s, i) =>
                  i === action.slideIndex ? { ...s, content: action.content! } : s
                )
              );
            }
            break;
        }
      },
      getState: () => ({ slides, activeSlide }),
    }));

    const currentSlide = slides[activeSlide];

    return (
      <div style={{ display: "flex", height: "100%" }}>
        {/* Slide thumbnails */}
        <div
          style={{
            width: "160px",
            backgroundColor: "#18181b",
            borderRight: "1px solid #27272a",
            overflowY: "auto",
            padding: "8px",
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              onClick={() => setActiveSlide(i)}
              style={{
                aspectRatio: "16/9",
                backgroundColor: activeSlide === i ? "#27272a" : "#0a0a0a",
                border: `2px solid ${activeSlide === i ? "#3b82f6" : "#27272a"}`,
                borderRadius: "4px",
                marginBottom: "8px",
                padding: "8px",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: "6px", color: "#71717a", fontWeight: 600 }}>
                {slide.title}
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newSlide: Slide = { id: Date.now().toString(), title: "New Slide", content: "" };
              setSlides([...slides, newSlide]);
              setActiveSlide(slides.length);
            }}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "transparent",
              border: "1px dashed #27272a",
              borderRadius: "4px",
              color: "#52525b",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            + Add slide
          </button>
        </div>

        {/* Slide editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Slide canvas */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              backgroundColor: "#0a0a0a",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "800px",
                aspectRatio: "16/9",
                backgroundColor: "#1a1a2e",
                borderRadius: "8px",
                padding: "48px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <input
                type="text"
                value={currentSlide?.title || ""}
                onChange={(e) =>
                  setSlides((prev) =>
                    prev.map((s, i) => (i === activeSlide ? { ...s, title: e.target.value } : s))
                  )
                }
                placeholder="Slide title"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#fff",
                  outline: "none",
                  marginBottom: "24px",
                }}
              />
              <textarea
                value={currentSlide?.content || ""}
                onChange={(e) =>
                  setSlides((prev) =>
                    prev.map((s, i) => (i === activeSlide ? { ...s, content: e.target.value } : s))
                  )
                }
                placeholder="Slide content..."
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "16px",
                  color: "#a1a1aa",
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>

          {/* Slide number */}
          <div
            style={{
              padding: "8px 16px",
              borderTop: "1px solid #27272a",
              fontSize: "11px",
              color: "#52525b",
              textAlign: "center",
            }}
          >
            Slide {activeSlide + 1} of {slides.length}
          </div>
        </div>
      </div>
    );
  }
);
