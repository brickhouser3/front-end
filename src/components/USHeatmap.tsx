import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { statePerformance } from "../lib/mockStatePerformance";

/* ======================================================
   GEO CONFIG
====================================================== */

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL","02": "AK","04": "AZ","05": "AR","06": "CA","08": "CO",
  "09": "CT","10": "DE","11": "DC","12": "FL","13": "GA","15": "HI",
  "16": "ID","17": "IL","18": "IN","19": "IA","20": "KS","21": "KY",
  "22": "LA","23": "ME","24": "MD","25": "MA","26": "MI","27": "MN",
  "28": "MS","29": "MO","30": "MT","31": "NE","32": "NV","33": "NH",
  "34": "NJ","35": "NM","36": "NY","37": "NC","38": "ND","39": "OH",
  "40": "OK","41": "OR","42": "PA","44": "RI","45": "SC","46": "SD",
  "47": "TN","48": "TX","49": "UT","50": "VT","51": "VA","53": "WA",
  "54": "WV","55": "WI","56": "WY",
};

/* ======================================================
   KPI CONFIG
====================================================== */

const KPI_ORDER = [
  "Volume",
  "Revenue",
  "Share",
  "PODs",
  "TAPs",
  "Displays",
  "Ad Share",
  "Velocity",
];

type KpiMetric = { value: number; target: number };

function getMockMetrics(): Record<string, KpiMetric> {
  return Object.fromEntries(
    KPI_ORDER.map((kpi) => [
      kpi,
      { value: 96 + Math.round(Math.random() * 10), target: 100 },
    ])
  );
}

/* ======================================================
   COLOR HELPERS
====================================================== */

function performanceColor(value?: number) {
  if (typeof value !== "number") return "#e5e7eb";
  if (value >= 1.05) return "#166534";
  if (value >= 1.0) return "#22c55e";
  if (value >= 0.95) return "#ef4444";
  return "#b91c1c";
}

function deltaColor(delta: number) {
  if (delta > 0) return "#16a34a";
  if (delta < 0) return "#dc2626";
  return "#6b7280";
}

/* ======================================================
   COMPONENT
====================================================== */

export default function USHeatmap({
  onSelectState,
}: {
  onSelectState?: (state: string) => void;
}) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const metrics = hoveredState ? getMockMetrics() : null;

  return (
    <div
      style={{
        width: "100%",
        height: "170px",
        padding: "0.75rem",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          height: "100%",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        {/* ================= LEFT ================= */}
        <div
          style={{
            width: 280,        // 👈 give title + cards more room
            flexShrink: 0,     // 👈 prevents map from stealing width
            minWidth: 280,
          }}
        >
          {/* Title */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.18))",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1f2937"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "#111827",
                  whiteSpace: "nowrap", // 👈 no wrap
                  overflow: "hidden",
                  textOverflow: "ellipsis",
		  marginBottom: "-0.15rem",
                }}
              >
                U.S. Performance Heatmap
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#6b7280",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
		  lineHeight: 1.0, 
		  paddingBottom: "0.5rem",
                }}
              >
                Indexed vs baseline
              </div>
            </div>
          </div>

          {/* ================= EXEC-STYLE CALLOUTS ================= */}
          <div
            style={{
              marginTop: "0.65rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            {[
              { tone: "navy", text: "West leading volume vs target" },
              { tone: "amber", text: "Midwest softness driven by share" },
              { tone: "gold", text: "South accelerating on displays" },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.38rem 0.5rem 0.38rem 0.7rem", // 👈 tighter vertically
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.70)",
                  border: "1px solid rgba(10,22,51,0.10)",
                  boxShadow:
                    "0 7px 14px rgba(10,22,51,0.05), inset 0 1px 0 rgba(255,255,255,0.55)",
                  fontSize: "0.66rem", // 👈 slightly smaller
                  color: "#0A1633",
                  lineHeight: 1.15,
                }}
              >
                {/* Rail */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 5,
                    bottom: 5,
                    width: 3,
                    borderRadius: 999,
                    background:
                      item.tone === "navy"
                        ? "rgba(10,22,51,0.55)"
                        : item.tone === "amber"
                        ? "rgba(245,158,11,0.75)"
                        : "rgba(242,214,117,0.85)",
                  }}
                />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= MAP LANE ================= */}
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            justifyContent: "flex-end", // 👈 anchor right
            alignItems: "flex-start",
            paddingLeft: "0.75rem",     // 👈 pushes map right away from title lane
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              maxWidth: 520,            // 👈 hard cap so it doesn't encroach left
            }}
          >
            <ComposableMap
              projection="geoAlbersUsa"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateCode = FIPS_TO_STATE[geo.id as string];
                    const value = statePerformance[stateCode];

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() =>
                          stateCode && setHoveredState(stateCode)
                        }
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() =>
                          stateCode && onSelectState?.(stateCode)
                        }
                        style={{
                          default: {
                            fill: performanceColor(value),
                            outline: "none",
                          },
                          hover: {
                            fill: "#1e40af",
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "#1e3a8a",
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
        </div>
      </div>

      {/* ================= TOOLTIP ================= */}
      {hoveredState && metrics && (
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            zIndex: 9999,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(6px)",
            borderRadius: 12,
            boxShadow: "0 14px 36px rgba(10,22,51,0.22)",
            padding: "0.65rem 0.75rem",
            fontSize: "0.65rem",
            width: 220,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: "0.4rem" }}>
            {hoveredState} · KPI vs Target
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              rowGap: "0.25rem",
            }}
          >
            {KPI_ORDER.map((kpi) => {
              const { value, target } = metrics[kpi];
              const delta = value - target;

              return (
                <React.Fragment key={kpi}>
                  <div>{kpi}</div>
                  <div style={{ color: deltaColor(delta) }}>
                    {delta > 0 ? "▲ +" : delta < 0 ? "▼ " : ""}
                    {delta}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
