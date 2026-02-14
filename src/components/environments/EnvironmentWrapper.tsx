"use client";

import { ReactNode } from "react";
import { EnvironmentType } from "@/lib/assessment-types";

interface EnvironmentWrapperProps {
  type: EnvironmentType;
  children: ReactNode;
}

export function EnvironmentWrapper({ type, children }: EnvironmentWrapperProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        borderLeft: "1px solid #27272a",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 16px",
          borderBottom: "1px solid #27272a",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#71717a",
          textTransform: "uppercase",
        }}
      >
        {type}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
}
