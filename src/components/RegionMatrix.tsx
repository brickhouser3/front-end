import React, { useState } from "react";
import {
  BarChart3,
  DollarSign,
  Percent,
  MapPin,
  Droplet,
  LayoutGrid,
  Gauge,
  Megaphone,
  ChevronRight,
} from "lucide-react";

import { useDrillState, createRowPath } from "./DrillEngine";

/* ======================================================
   TYPES
====================================================== */

type RegionMatrixProps = {
  selectedMetric?: string | null;
};

/* ======================================================
   LAYOUT CONSTANTS (SINGLE SOURCE OF TRUTH)
====================================================== */

const FIRST_COL_WIDTH = "180px";
const COLUMN_GAP = "0.4rem";
const ROW_PADDING_X = "0.35rem";
const ROW_PADDING_Y = "0.4rem";

const MATRIX_GRID = (kpiCount: number) =>
  `${FIRST_COL_WIDTH} repeat(${kpiCount}, minmax(0, 1fr))`;

const columnCellStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1.15,
};

/* ======================================================
   CONFIG
====================================================== */

const regions = [
  { key: "NE", name: "Northeast" },
  { key: "MW", name: "Midwest" },
  { key: "S", name: "Great Lakes" },
  { key: "W", name: "Southeast" },
  { key: "C", name: "South Central" },
  { key: "O", name: "West" },
];

const statesByRegion: Record<string, { key: string; name: string }[]> = {
  NE: [
    { key: "NY", name: "New York" },
    { key: "MA", name: "Massachusetts" },
    { key: "PA", name: "Pennsylvania" },
    { key: "NJ", name: "New Jersey" },
    { key: "CT", name: "Connecticut" },
  ],
  MW: [
    { key: "IL", name: "Illinois" },
    { key: "OH", name: "Ohio" },
    { key: "MI", name: "Michigan" },
    { key: "IN", name: "Indiana" },
    { key: "WI", name: "Wisconsin" },
  ],
  S: [
    { key: "TX", name: "Texas" },
    { key: "FL", name: "Florida" },
    { key: "GA", name: "Georgia" },
    { key: "NC", name: "North Carolina" },
    { key: "TN", name: "Tennessee" },
  ],
  W: [
    { key: "CA", name: "California" },
    { key: "AZ", name: "Arizona" },
    { key: "WA", name: "Washington" },
    { key: "OR", name: "Oregon" },
    { key: "CO", name: "Colorado" },
  ],
  C: [
    { key: "MO", name: "Missouri" },
    { key: "KS", name: "Kansas" },
    { key: "IA", name: "Iowa" },
    { key: "NE", name: "Nebraska" },
    { key: "OK", name: "Oklahoma" },
  ],
  O: [
    { key: "PR", name: "Puerto Rico" },
    { key: "HI", name: "Hawaii" },
    { key: "AK", name: "Alaska" },
    { key: "GU", name: "Guam" },
    { key: "VI", name: "Virgin Islands" },
  ],
};

const kpis = [
  { key: "volume", label: "Volume", icon: BarChart3 },
  { key: "revenue", label: "Net Rev", icon: DollarSign },
  { key: "share", label: "Share", icon: Percent },
  { key: "pods", label: "PODs", icon: MapPin },
  { key: "taps", label: "TAPs", icon: Droplet },
  { key: "displays", label: "Displays", icon: LayoutGrid },
  { key: "avd", label: "AVD", icon: Gauge },
  { key: "adshare", label: "Ad Share", icon: Megaphone },
];

/* ======================================================
   DUMMY DATA
====================================================== */

const makeCell = (value: string, delta: number) => ({ value, delta });

const regionData: Record<string, Record<string, { value: string; delta: number }>> =
  Object.fromEntries(
    regions.map((r, i) => [
      r.key,
      {
        volume: makeCell((95 + i * 2).toFixed(1), 1.2 - i * 0.2),
        revenue: makeCell(`$${(0.8 + i * 0.05).toFixed(2)}B`, 0.4 - i * 0.1),
        share: makeCell((22 + i * 0.6).toFixed(1) + "%", 0.5 - i * 0.1),
        pods: makeCell(`${380 + i * 12}K`, 1.1 - i * 0.2),
        taps: makeCell(`${85 + i * 2.3}K`, 0.7 - i * 0.1),
        displays: makeCell(`${115 + i * 4}K`, 1.6 - i * 0.3),
        avd: makeCell((7.4 + i * 0.15).toFixed(1), 0.3 - i * 0.05),
        adshare: makeCell((17.5 + i * 0.4).toFixed(1) + "%", 0.4 - i * 0.1),
      },
    ])
  );

const stateData: Record<string, Record<string, { value: string; delta: number }>> =
  Object.fromEntries(
    Object.values(statesByRegion)
      .flat()
      .map((s, i) => [
        s.key,
        {
          volume: makeCell((18 + i * 0.9).toFixed(1), 0.8 - i * 0.05),
          revenue: makeCell(`$${(0.12 + i * 0.01).toFixed(2)}B`, 0.3 - i * 0.04),
          share: makeCell((4.2 + i * 0.2).toFixed(1) + "%", 0.2 - i * 0.03),
          pods: makeCell(`${68 + i * 2}K`, 0.6 - i * 0.05),
          taps: makeCell(`${14 + i * 0.6}K`, 0.4 - i * 0.04),
          displays: makeCell(`${22 + i * 1.1}K`, 0.7 - i * 0.06),
          avd: makeCell((6.5 + i * 0.1).toFixed(1), 0.2 - i * 0.03),
          adshare: makeCell((3.8 + i * 0.15).toFixed(1) + "%", 0.2 - i * 0.04),
        },
      ])
  );

/* ======================================================
   HELPERS
====================================================== */

function deltaColor(delta: number) {
  if (delta > 0) return "#166534";
  if (delta < 0) return "#b91c1c";
  return "#6b7280";
}

/* ======================================================
   COMPONENT
====================================================== */

export default function RegionMatrix({ selectedMetric }: RegionMatrixProps) {
  const drill = useDrillState();
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  return (
    <div
      style={{
        padding: "0.25rem",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontVariantNumeric: "tabular-nums",
        height: "100%",
        overflow: "auto",
      }}
    >
      {/* ================= STICKY HEADERS ================= */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "white",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: MATRIX_GRID(kpis.length),
            gap: COLUMN_GAP,
            padding: `${ROW_PADDING_Y} ${ROW_PADDING_X}`,
            alignItems: "stretch",
          }}
        >
          <div />
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            const isHovered = hoverCol === idx;

            return (
              <div
                key={kpi.key}
                onMouseEnter={() => setHoverCol(idx)}
                onMouseLeave={() => setHoverCol(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isHovered
                    ? "rgba(59,130,246,0.06)"
                    : "transparent",
                  transition: "background 120ms ease",
                }}
              >
                <div style={columnCellStyle}>
                  <Icon size={13} />
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      color: "#9ca3af",
                      marginTop: "2px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {kpi.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= ROWS ================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.05rem" }}>
        {regions.map(region => {
          const regionPath = createRowPath([
            { type: "region", id: region.key },
          ]);
          const regionExpanded = drill.isOpen(regionPath);

          return (
            <React.Fragment key={region.key}>
              {/* REGION ROW */}
              <div
                onClick={() => drill.toggle(regionPath)}
                style={{
                  display: "grid",
                  gridTemplateColumns: MATRIX_GRID(kpis.length),
                  gap: COLUMN_GAP,
                  padding: `${ROW_PADDING_Y} ${ROW_PADDING_X}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: regionExpanded
                    ? "rgba(11,30,58,0.08)"
                    : "transparent",
                }}
              >
                <div
                  style={{
                    fontWeight: 650,
                    fontSize: "1.0rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ChevronRight
                    size={14}
                    style={{
                      transform: regionExpanded
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                    }}
                  />
                  {region.name}
                </div>

                {kpis.map((kpi, idx) => {
                  const cell = regionData[region.key][kpi.key];
                  const faded =
                    selectedMetric && selectedMetric !== kpi.key;

                  const isHovered = hoverCol === idx;

                  return (
                    <div
                      key={kpi.key}
                      onMouseEnter={() => setHoverCol(idx)}
                      onMouseLeave={() => setHoverCol(null)}
                      style={{
                        ...columnCellStyle,
                        opacity: faded ? 0.35 : 1,
                        background: isHovered
                          ? "rgba(59,130,246,0.04)"
                          : "transparent",
                        transition: "background 120ms ease",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: ".9rem" }}>
                        {cell.value}
                      </div>
                      <div
                        style={{
                          fontSize: "0.5rem",
                          fontWeight: 600,
                          color: deltaColor(cell.delta),
                        }}
                      >
                        {cell.delta > 0 ? "+" : ""}
                        {cell.delta.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STATE ROWS */}
              {regionExpanded &&
                statesByRegion[region.key].map(state => {
                  const statePath = createRowPath([
                    { type: "region", id: region.key },
                    { type: "state", id: state.key },
                  ]);

                  return (
                    <div
                      key={state.key}
                      onClick={e => {
                        e.stopPropagation();
                        drill.toggle(statePath);
                      }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: MATRIX_GRID(kpis.length),
                        gap: COLUMN_GAP,
                        padding: `${ROW_PADDING_Y} ${ROW_PADDING_X}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: "rgba(11,30,58,0.04)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          paddingLeft: "18px",
                        }}
                      >
                        <ChevronRight size={12} />
                        {state.name}
                      </div>

                      {kpis.map((kpi, idx) => {
                        const cell = stateData[state.key][kpi.key];
                        const isHovered = hoverCol === idx;

                        return (
                          <div
                            key={kpi.key}
                            onMouseEnter={() => setHoverCol(idx)}
                            onMouseLeave={() => setHoverCol(null)}
                            style={{
                              ...columnCellStyle,
                              background: isHovered
                                ? "rgba(59,130,246,0.04)"
                                : "transparent",
                              transition: "background 120ms ease",
                            }}
                          >
                            <div style={{ fontWeight: 500, fontSize: "0.7rem" }}>
                              {cell.value}
                            </div>
                            <div
                              style={{
                                fontSize: "0.6rem",
                                fontWeight: 600,
                                color: deltaColor(cell.delta),
                              }}
                            >
                              {cell.delta > 0 ? "+" : ""}
                              {cell.delta.toFixed(2)}%
                            </div>
                          </div>
                        );
                      })}
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
