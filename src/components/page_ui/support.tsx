import React, { useMemo } from "react";
import type { TestResult } from "../../pages/support";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- 1. Define the Chart Component ---
function VolumeChart({ apiResult }: { apiResult: any }) {
  const chartData = useMemo(() => {
    if (!apiResult?.result?.data_array) return [];

    // Transform Databricks Array-of-Arrays into Recharts Objects
    return apiResult.result.data_array.map((row: string[]) => ({
      month: row[0], // "202501"
      "2025 Volume": parseFloat(row[1]),
      "2024 Volume": parseFloat(row[2]),
    }));
  }, [apiResult]);

  if (chartData.length === 0) return null;

  return (
    <div style={{ 
      marginTop: 20, 
      marginBottom: 20, 
      padding: 15, 
      background: "white", 
      borderRadius: 12, 
      border: "1px solid rgba(15,23,42,0.1)" 
    }}>
      <h3 style={{ margin: "0 0 15px 0", fontSize: 16, fontWeight: 700 }}>
        📊 Volume Performance (2025 vs 2024)
      </h3>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
            <XAxis
              dataKey="month"
              tickFormatter={(val) => `${val.substring(4, 6)}/${val.substring(2, 4)}`}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              formatter={(value: number) => new Intl.NumberFormat('en-US').format(Math.round(value))}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar dataKey="2025 Volume" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar dataKey="2024 Volume" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 2. Main Support UI ---
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
      </div>

      {results.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(15,23,42,0.6)" }}>
          No test results yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
          {results.map((r, idx) => {
            // ✅ Check if this result is for the Volume KPI
            const isVolumeKpi = r.name.toLowerCase().includes("volume") && r.ok;

            return (
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
                </div>

                {/* ✅ INSERT CHART HERE IF APPLICABLE */}
                {isVolumeKpi && <VolumeChart apiResult={r.json} />}

                <details style={{ marginTop: 10 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                    Parsed JSON
                  </summary>
                  <pre style={{ marginTop: 8, fontSize: 12, overflow: "auto", maxHeight: 200 }}>
                    {JSON.stringify(r.json, null, 2)}
                  </pre>
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
            );
          })}
        </div>
      )}
    </div>
  );
}