"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import type { DatabaseAction } from "@/lib/assessment-types";

interface Schema {
  [table: string]: string[];
}

interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

interface DatabaseEnvironmentProps {
  initialSchema?: Schema;
  sampleData?: boolean;
}

export interface DatabaseEnvironmentRef {
  executeAction: (action: DatabaseAction) => void;
  getState: () => { query: string; results: QueryResult | null; history: string[] };
}

// Sample data generator for demo
function generateSampleData(schema: Schema): Record<string, QueryResult> {
  const data: Record<string, QueryResult> = {};
  
  if (schema.users) {
    data.users = {
      columns: schema.users,
      rows: [
        { id: 1, email: "alice@example.com", created_at: "2024-01-15", last_login: "2024-02-10" },
        { id: 2, email: "bob@example.com", created_at: "2024-01-20", last_login: "2024-02-01" },
        { id: 3, email: "carol@example.com", created_at: "2024-02-01", last_login: "2024-02-14" },
      ],
    };
  }
  
  if (schema.orders) {
    data.orders = {
      columns: schema.orders,
      rows: [
        { id: 1, user_id: 1, amount: 99.99, created_at: "2024-02-01" },
        { id: 2, user_id: 1, amount: 149.50, created_at: "2024-02-05" },
        { id: 3, user_id: 3, amount: 299.00, created_at: "2024-02-10" },
      ],
    };
  }

  return data;
}

export const DatabaseEnvironment = forwardRef<DatabaseEnvironmentRef, DatabaseEnvironmentProps>(
  function DatabaseEnvironment({ initialSchema = {}, sampleData = true }, ref) {
    const [schema] = useState<Schema>(initialSchema);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<QueryResult | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showSchema, setShowSchema] = useState(true);

    const sampleDataSet = sampleData ? generateSampleData(schema) : {};

    useImperativeHandle(ref, () => ({
      executeAction: (action: DatabaseAction) => {
        switch (action.type) {
          case "runQuery":
            if (action.query) {
              setQuery(action.query);
              // Simulate query execution
              executeQuery(action.query);
            }
            break;
          case "showSchema":
            setShowSchema(true);
            break;
          case "explainQuery":
            if (action.query) {
              setResults({
                columns: ["QUERY PLAN"],
                rows: [
                  { "QUERY PLAN": "Seq Scan on " + (action.table || "table") },
                  { "QUERY PLAN": "  -> Filter: (condition)" },
                  { "QUERY PLAN": "Planning Time: 0.123 ms" },
                  { "QUERY PLAN": "Execution Time: 0.456 ms" },
                ],
              });
            }
            break;
        }
      },
      getState: () => ({ query, results, history }),
    }));

    const executeQuery = (sql: string) => {
      setError(null);
      setHistory((prev) => [...prev, sql]);

      // Simple query parser for demo
      const lowerSql = sql.toLowerCase().trim();
      
      if (lowerSql.startsWith("select")) {
        // Find which table is being queried
        const tableMatch = lowerSql.match(/from\s+(\w+)/);
        if (tableMatch && sampleDataSet[tableMatch[1]]) {
          setResults(sampleDataSet[tableMatch[1]]);
        } else {
          setResults({
            columns: ["result"],
            rows: [{ result: "Query executed (simulated)" }],
          });
        }
      } else if (lowerSql.startsWith("show tables") || lowerSql.startsWith("\\dt")) {
        setResults({
          columns: ["table_name"],
          rows: Object.keys(schema).map((t) => ({ table_name: t })),
        });
      } else {
        setResults({
          columns: ["status"],
          rows: [{ status: "Query executed successfully" }],
        });
      }
    };

    const handleRun = () => {
      if (query.trim()) {
        executeQuery(query);
      }
    };

    return (
      <div style={{ display: "flex", height: "100%" }}>
        {/* Schema sidebar */}
        {showSchema && (
          <div
            style={{
              width: "220px",
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
              SCHEMA
            </div>
            {Object.entries(schema).map(([table, columns]) => (
              <div key={table} style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#e4e4e7",
                    marginBottom: "6px",
                  }}
                >
                  📁 {table}
                </div>
                {columns.map((col) => (
                  <div
                    key={col}
                    style={{
                      fontSize: "12px",
                      color: "#71717a",
                      paddingLeft: "16px",
                      marginBottom: "2px",
                    }}
                  >
                    {col}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Query editor */}
          <div
            style={{
              padding: "12px",
              borderBottom: "1px solid #27272a",
            }}
          >
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM users WHERE..."
              style={{
                width: "100%",
                height: "100px",
                backgroundColor: "#0a0a0a",
                border: "1px solid #27272a",
                borderRadius: "6px",
                padding: "12px",
                fontSize: "13px",
                fontFamily: "ui-monospace, monospace",
                color: "#e4e4e7",
                resize: "vertical",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                onClick={handleRun}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ▶ Run Query
              </button>
              <button
                onClick={() => setQuery("")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "#71717a",
                  border: "1px solid #27272a",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
            {error && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid #ef4444",
                  borderRadius: "6px",
                  color: "#ef4444",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {error}
              </div>
            )}

            {results && (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  <thead>
                    <tr>
                      {results.columns.map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#18181b",
                            border: "1px solid #27272a",
                            color: "#a1a1aa",
                            fontWeight: 600,
                            textAlign: "left",
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row, i) => (
                      <tr key={i}>
                        {results.columns.map((col) => (
                          <td
                            key={col}
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #27272a",
                              color: "#e4e4e7",
                            }}
                          >
                            {String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#52525b" }}>
                  {results.rows.length} row(s) returned
                </div>
              </div>
            )}

            {!results && !error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#52525b",
                  fontSize: "13px",
                }}
              >
                Run a query to see results
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
