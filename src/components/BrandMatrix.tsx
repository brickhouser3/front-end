import React, { useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ChevronRight } from "lucide-react";

import { useDrillState, createRowPath } from "./DrillEngine";

/* ======================================================
   TYPES
====================================================== */

type BrandMatrixProps = {
  selectedMetric?: string | null;
};

/* ======================================================
   LAYOUT CONSTANTS (MATCH REGION MATRIX)
====================================================== */

const FIRST_COL_WIDTH = "180px";
const COLUMN_GAP = "0.4rem";
const ROW_PADDING_X = "0.35rem";
const ROW_PADDING_Y = "0.2rem";

/* Header-specific rhythm */
const HEADER_PADDING_TOP = "0.35rem";
const HEADER_PADDING_BOTTOM = "0.55rem";
const HEADER_DIVIDER_PADDING_BOTTOM = "0.35rem";

const MATRIX_GRID = (brandCount: number) =>
  `${FIRST_COL_WIDTH} repeat(${brandCount}, minmax(0, 1fr))`;

const columnCellStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

/* Chevron centering */
const chevBoxStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 18px",
};

const rowLabelBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  minHeight: 24,
  lineHeight: 1.1,
};

/* ======================================================
   SIZES (LOCKED TO REGION MATRIX)
====================================================== */

const SIZES = {
  topHeader: "1.0rem",
  topValue: "0.9rem",
  topDelta: "0.5rem",

  subHeader: "0.75rem",
  subValue: "0.7rem",
  subDelta: "0.5rem",
};

/* ======================================================
   CONFIG
====================================================== */

const brands = [
  { key: "BDL", name: "Bud Light", logo: "/img/brand_logos/BDL.jpg" },
  { key: "BHL", name: "Busch Light", logo: "/img/brand_logos/BHL.jpg" },
  { key: "MUL", name: "Michelob Ultra", logo: "/img/brand_logos/MUL.jpg" },
  { key: "BUD", name: "Budweiser", logo: "/img/brand_logos/BUD.jpg" },
  { key: "CWFM", name: "Cutwater", logo: "/img/brand_logos/CWFM.jpg" },
  { key: "KGA", name: "Big Wave", logo: "/img/brand_logos/KGA.png" },
  { key: "NUTRL", name: "NUTRL", logo: "/img/brand_logos/NUTRL.png" },
  { key: "STA", name: "Stella Artois", logo: "/img/brand_logos/STA.jpg" },
];

const kpis = [
  { key: "volume", label: "Volume" },
  { key: "revenue", label: "Net Revenue" },
  { key: "share", label: "Share" },
  { key: "pods", label: "PODs" },
  { key: "taps", label: "TAPs" },
  { key: "displays", label: "Displays" },
  { key: "avd", label: "AVD" },
  { key: "adshare", label: "Ad Share" },
];

/* ======================================================
   HIERARCHY
====================================================== */

const regions = [
  {
    id: "mw",
    name: "Midwest",
    states: [
      {
        id: "MO",
        name: "Missouri",
        channels: [
          { id: "grocery", name: "Grocery" },
          { id: "convenience", name: "Convenience" },
        ],
      },
    ],
  },
  {
    id: "west",
    name: "West",
    states: [
      {
        id: "CA",
        name: "California",
        channels: [{ id: "grocery", name: "Grocery" }],
      },
    ],
  },
];

/* ======================================================
   METRIC STUB (UPDATED NET REV LOGIC)
====================================================== */

function getMetricValue(
  kpi: string,
  brand: string,
  grainKey: string
): { value: string; delta: number } {
  const hash = Math.abs(
    (kpi + brand + grainKey)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0)
  );

  const basePct = ((hash % 80) - 40) / 10; // -4.0% to +4.0%
  const delta = ((hash % 60) - 30) / 10;   // -3.0% to +3.0%

  // Net Revenue now behaves like a trend %
  if (kpi === "revenue") {
    return {
      value: `${basePct.toFixed(1)}%`,
      delta,
    };
  }

  if (kpi === "share" || kpi === "adshare") {
    return {
      value: `${(Math.abs(basePct) / 2).toFixed(1)}%`,
      delta,
    };
  }

  return {
    value: (Math.abs(basePct) * 10).toFixed(1),
    delta,
  };
}

/* ======================================================
   HELPERS
====================================================== */

function deltaColor(delta: number) {
  if (delta > 0) return "#166534";
  if (delta < 0) return "#b91c1c";
  return "#6b7280";
}

function formatDelta(delta: number) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(2)}%`;
}

/* ======================================================
   CELL RENDER
====================================================== */

function MetricCell({
  value,
  delta,
  hovered,
  size,
}: {
  value: string;
  delta: number;
  hovered: boolean;
  size: "top" | "sub";
}) {
  return (
    <div
      style={{
        ...columnCellStyle,
        background: hovered ? "rgba(59,130,246,0.04)" : "transparent",
      }}
    >
      <div
        style={{
          fontSize: size === "top" ? SIZES.topValue : SIZES.subValue,
          fontWeight: 600,
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: size === "top" ? SIZES.topDelta : SIZES.subDelta,
          fontWeight: 600,
          color: deltaColor(delta),
          lineHeight: 1.05,
        }}
      >
        {formatDelta(delta)}
      </div>
    </div>
  );
}

/* ======================================================
   COMPONENT
====================================================== */

export default function BrandMatrix({ selectedMetric }: BrandMatrixProps) {
  const baseUrl = useBaseUrl("/");
  const drill = useDrillState();
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const brandsWithLogos = brands.map(b => ({
    ...b,
    logo: `${baseUrl}${b.logo.replace(/^\//, "")}`,
  }));

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      
{/* ================= MATRIX TITLE ================= */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 0.75rem 1.5rem",
  }}
>
  {/* Icon badge */}
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
    {/* pick ONE icon that represents the matrix */}
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  </div>

  {/* Text */}
  <div style={{ lineHeight: 1.1 }}>
    <div
      style={{
        fontSize: "1.05rem",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: "#111827",
      }}
    >
      Brand Performance
    </div>
    <div
      style={{
        fontSize: "0.7rem",
        fontWeight: 500,
        color: "#6b7280",
        marginTop: "0.15rem",
      }}
    >
      By KPI · Click rows to drill
    </div>
  </div>
</div>


{/* ================= STICKY HEADER ================= */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "white",
          paddingTop: HEADER_PADDING_TOP,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: MATRIX_GRID(brandsWithLogos.length),
            gap: COLUMN_GAP,
            padding: `0 ${ROW_PADDING_X} ${HEADER_PADDING_BOTTOM}`,
            alignItems: "center",
          }}
        >
          <div />
          {brandsWithLogos.map((b, idx) => (
            <div
              key={b.key}
              onMouseEnter={() => setHoverCol(idx)}
              onMouseLeave={() => setHoverCol(null)}
              style={{
                display: "flex",
                justifyContent: "center",
                background:
                  hoverCol === idx
                    ? "rgba(59,130,246,0.06)"
                    : "transparent",
              }}
            >
              <img
                src={b.logo}
                alt={b.name}
                style={{
                  height: 30, // 👈 larger logos
                  objectFit: "contain",
                }}
              />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            marginBottom: HEADER_DIVIDER_PADDING_BOTTOM,
          }}
        />
      </div>

      {/* ================= BODY ================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.05rem" }}>
        {kpis.map(kpi => {
          const kpiPath = createRowPath({ type: "kpi", id: kpi.key });
          const kpiOpen = drill.isOpen(kpiPath);

          return (
            <React.Fragment key={kpi.key}>
              {/* KPI ROW */}
              <div
                onClick={() => drill.toggle(kpiPath)}
                style={{
                  display: "grid",
                  gridTemplateColumns: MATRIX_GRID(brandsWithLogos.length),
                  gap: COLUMN_GAP,
                  padding: `${ROW_PADDING_Y} ${ROW_PADDING_X}`,
                  cursor: "pointer",
		  marginBottom: kpiOpen ? "0.05rem" : "0.2rem",
		  background: kpiOpen ? "rgba(11,30,58,0.08)" : "transparent",
    		  borderRadius: "8px",

                }}
              >
                <div
                  style={{
                    ...rowLabelBase,
                    fontSize: SIZES.topHeader,
                    fontWeight: 650,
                  }}
                >
                  <span style={chevBoxStyle}>
                    <ChevronRight
                      size={14}
                      style={{
                        transform: kpiOpen
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                        transition: "transform 160ms ease",
                        opacity: 0.6,
                      }}
                    />
                  </span>
                  {kpi.label}
                </div>

                {brandsWithLogos.map((b, idx) => {
                  const cell = getMetricValue(kpi.key, b.key, kpi.key);
                  return (
                    <div
                      key={b.key}
                      onMouseEnter={() => setHoverCol(idx)}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      <MetricCell
                        value={cell.value}
                        delta={cell.delta}
                        hovered={hoverCol === idx}
                        size="top"
                      />
                    </div>
                  );
                })}
              </div>

              {/* LOWER LEVELS */}
              {kpiOpen &&
                regions.map(r => {
                  const regionPath = createRowPath([
                    { type: "kpi", id: kpi.key },
                    { type: "region", id: r.id },
                  ]);
                  const regionOpen = drill.isOpen(regionPath);

                  return (
                    <div key={r.id}>
                      <div
                        onClick={() => drill.toggle(regionPath)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: MATRIX_GRID(
                            brandsWithLogos.length
                          ),
                          gap: COLUMN_GAP,
                          padding: `${ROW_PADDING_Y} ${ROW_PADDING_X}`,
                          background: "rgba(0,0,0,0.035)",
                        }}
                      >
                        <div
                          style={{
                            ...rowLabelBase,
                            fontSize: SIZES.subHeader,
                            fontWeight: 600,
                            paddingLeft: 14,
                          }}
                        >
                          <span style={chevBoxStyle}>
                            <ChevronRight
                              size={13}
                              style={{
                                transform: regionOpen
                                  ? "rotate(90deg)"
                                  : "rotate(0deg)",
                                transition: "transform 160ms ease",
                                opacity: 0.6,
                              }}
                            />
                          </span>
                          {r.name}
                        </div>

                        {brandsWithLogos.map((b, idx) => {
                          const cell = getMetricValue(
                            kpi.key,
                            b.key,
                            r.id
                          );
                          return (
                            <div
                              key={b.key}
                              onMouseEnter={() => setHoverCol(idx)}
                              onMouseLeave={() => setHoverCol(null)}
                            >
                              <MetricCell
                                value={cell.value}
                                delta={cell.delta}
                                hovered={hoverCol === idx}
                                size="sub"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
