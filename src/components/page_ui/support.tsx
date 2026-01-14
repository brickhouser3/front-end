import React from "react";
import type { TestResult } from "../../pages/support";

type Props = {
  apiUrl: string;
  origin: string;
  running: boolean;
  results: TestResult[];
  onRunTests: () => void;
};

export default function SupportUI({
  apiUrl,
  origin,
  running,
  results,
  onRunTests,
}: Props) {
  return (
    <div style={{ padding: 22, maxWidth: 1100 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Support</h1>

      <p style={{ marginTop: 10, color: "rgba(15,23,42,0.70)" }}>
        API diagnostics — Frontend → Vercel → Databricks
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 16,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onRunTests}
          disabled={running}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
            border: "1px solid rgba(15,23,42,0.15)",
            background: running ? "#e5e7eb" : "#ffffff",
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {running ? "Running…" : "Run API Tests"}
        </button>

        <div style={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
          Target: <code>{apiUrl}</code>
        </div>

        <div style={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
          Origin: <code>{origin}</code>
        </div>
      </div>

      {results.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(15,23,42,0.6)" }}>
          No test results yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
          {results.map((r, idx) => (
            <div
              key={idx}
              style={{
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.12)",
                background: "rgba(255,255,255,0.75)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {r.ok ? "✅" : "❌"} {r.name}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    opacity: 0.7,
                  }}
                >
                  {r.status} • {r.ms}ms
                </div>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                <div>
                  <strong>CORS allow-origin:</strong>{" "}
                  <code>
                    {r.responseHeaders["access-control-allow-origin"] ??
                      "(not exposed / missing)"}
                  </code>
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Signature:</strong>{" "}
                  <code>
                    {r.responseHeaders["x-mc-api"] ??
                      "(not exposed / missing)"}
                  </code>
                </div>
              </div>

              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                  Parsed JSON
                </summary>
                <pre style={{ marginTop: 8, fontSize: 12 }}>
                  {JSON.stringify(r.json, null, 2)}
                </pre>
              </details>

              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                  Raw response
                </summary>
                <pre style={{ marginTop: 8, fontSize: 12 }}>{r.raw}</pre>
              </details>

              {!r.ok && r.error ? (
                <div
                  style={{
                    marginTop: 10,
                    color: "rgba(220,38,38,0.9)",
                    fontSize: 12,
                  }}
                >
                  <strong>Error:</strong> {r.error}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
