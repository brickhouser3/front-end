import React from "react";
import { useHistory } from "react-router-dom";
import AppLayout from "../../components/AppLayout";

import USHeatmap from "../../components/USHeatmap";
import RegionMatrix from "../../components/RegionMatrix";
import BrandMatrix from "../../components/BrandMatrix";

import KPI from "../../components/kpi";
import TrendChart from "../../components/TrendChart";
import { volumeTrend } from "../../lib/mockTrendData";
import { TrendingDown, TrendingUp, Sparkles } from "lucide-react";

import { useExecVolumeKpi } from "../../hooks/useExecVolumeKpi";
import { formatBBLs } from "../../lib/format";

/* ======================================================
   CONFIG
====================================================== */

const METRIC_COLORS: Record<string, string> = {
  volume: "#DCE7FF",
  revenue: "#D6F4F1",
  share: "#DDF5E6",
  pods: "#FFE8CC",
  taps: "#FFE1E1",
  displays: "#EFE3FF",
  avd: "#E9EEF5",
  adshare: "#F6E1FA",
};

const EXEC_UPDATES = [
  {
    label: "Volume",
    text: "Down vs LY driven by Midwest softness; West trending positive L4W.",
    icon: TrendingDown,
    tone: "amber" as const,
  },
  {
    label: "Share",
    text: "BIR share expanding in Grocery and Club; pressure in Convenience.",
    icon: TrendingUp,
    tone: "gold" as const,
  },
  {
    label: "Execution",
    text: "Displays and PODs outperforming plan ahead of summer resets.",
    icon: Sparkles,
    tone: "navy" as const,
  },
];

const EXEC_DUMMY_SECTIONS = [
  {
    title: "Executive Notes",
    subtitle:
      "Long-form narrative block to validate scroll behavior and header morph transitions.",
    bullets: [
      "This section is intentionally tall to enable page scrolling.",
      "You should see the TopBar slide away as you scroll down.",
      "As TopBar disappears, FilterBar should morph to pinned-top behavior.",
      "Scrolling back to top should return TopBar and revert the handoff.",
    ],
  },
  {
    title: "Opportunities & Risks",
    subtitle:
      "Additional content below the fold to test smoothness and layout stability.",
    bullets: [
      "Opportunity: Re-accelerate share in Convenience with targeted display bundles.",
      "Risk: Regional softness may persist if price gaps widen in key channels.",
      "Opportunity: Leverage Club strength to support halo effects into Grocery.",
      "Risk: Execution gains could normalize post-reset without sustained activation.",
    ],
  },
];

/* ======================================================
   PAGE
====================================================== */

export default function ExecutiveSummaryUI() {
  const history = useHistory();
  const [activeMetric, setActiveMetric] = React.useState<string | null>(null);

  const {
    data: volumeKpi,
    loading: volumeLoading,
    error: volumeError,
  } = useExecVolumeKpi();

  return (
    <AppLayout>
      {/* ================= EXEC STYLES ================= */}
      <style>{`
        .exec-scope,
        .exec-scope * {
          color: #0A1633;
        }

        .exec-update-shell{
          border-radius: 16px;
          padding: 1.05rem 1.2rem 1.1rem;
          background: linear-gradient(
            180deg,
            rgba(247,249,252,0.92),
            rgba(247,249,252,0.78)
          );
          border: 1px solid rgba(10,22,51,0.10);
          box-shadow:
            0 12px 26px rgba(10,22,51,0.08),
            inset 0 1px 0 rgba(255,255,255,0.55);
        }

        .exec-update-grid{
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 0.85rem;
        }

        .exec-update-card{
          position: relative;
          display: flex;
          gap: 0.75rem;
          padding: 0.85rem 0.9rem;
          border-radius: 14px;
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(10,22,51,0.10);
          box-shadow:
            0 10px 22px rgba(10,22,51,0.06),
            inset 0 1px 0 rgba(255,255,255,0.55);
          min-width: 0;
        }

        .exec-update-rail{
          position:absolute;
          left:0;
          top:10px;
          bottom:10px;
          width:3px;
          border-radius:999px;
        }

        .tone-navy .exec-update-rail{ background: rgba(10,22,51,0.55); }
        .tone-amber .exec-update-rail{ background: rgba(245,158,11,0.70); }
        .tone-gold .exec-update-rail{ background: rgba(242,214,117,0.80); }

        .subtle-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(120,130,150,0.4) transparent;
        }
        .subtle-scroll::-webkit-scrollbar { width: 6px; }
        .subtle-scroll::-webkit-scrollbar-track { background: transparent; }
        .subtle-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(120,130,150,0.35);
          border-radius: 999px;
        }
        .subtle-scroll:hover::-webkit-scrollbar-thumb {
          background-color: rgba(120,130,150,0.6);
        }

        .exec-section-card{
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(10,22,51,0.10);
          border-radius: 16px;
          box-shadow: 0 10px 24px rgba(10,22,51,0.10);
          padding: 1.25rem;
          min-width: 0;
        }
        .exec-section-title{
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.92rem;
        }
        .exec-section-subtitle{
          margin-top: 6px;
          opacity: 0.70;
          font-size: 0.85rem;
          max-width: 980px;
        }
        .exec-section-body{
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1rem;
        }
        .exec-note{
          border-radius: 14px;
          border: 1px solid rgba(10,22,51,0.08);
          background: rgba(247,249,252,0.85);
          padding: 0.95rem 1rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
          min-height: 240px;
        }
        .exec-note ul{
          margin: 0.6rem 0 0 1rem;
          padding: 0;
        }
        .exec-note li{
          margin: 0.35rem 0;
          opacity: 0.88;
          font-size: 0.86rem;
          line-height: 1.35;
        }
        .exec-filler{
          height: 320px;
          border-radius: 14px;
          border: 1px dashed rgba(10,22,51,0.14);
          background: linear-gradient(180deg, rgba(10,22,51,0.03), rgba(10,22,51,0.01));
          display: grid;
          place-items: center;
          opacity: 0.75;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.72rem;
        }
      `}</style>

      {/* ✅ This wrapper ensures we can exceed viewport height. */}
      <div
        className="exec-scope"
        style={{
          backgroundColor: "transparent",
          minWidth: 0,
          overflowX: "clip",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1.15rem",
            padding: "0.9rem 1rem",
            minWidth: 0,
          }}
        >
          {/* ================= EXEC UPDATE ================= */}
          <div className="exec-update-shell">
            <div className="exec-update-grid">
              {EXEC_UPDATES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`exec-update-card tone-${item.tone}`}
                  >
                    <div className="exec-update-rail" />
                    <Icon size={18} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800 }}>{item.label}</div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          opacity: 0.78,
                          minWidth: 0,
                        }}
                      >
                        {item.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= KPI CARDS ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1.05rem",
              minWidth: 0,
            }}
          >
            <KPI
              label="VOLUME"
              icon="volume"
              iconBg={METRIC_COLORS.volume}
              active={activeMetric === "volume"}
              onIconClick={() =>
                setActiveMetric((p) => (p === "volume" ? null : "volume"))
              }
              value={
                volumeLoading || !volumeKpi || volumeKpi.value == null
                  ? "—"
                  : formatBBLs(volumeKpi.value)
              }
              vsYTD={0}
              vsLastMonth={0}
            />

            <KPI
              label="NET REVENUE"
              value="$1.2B"
              vsYTD={4.8}
              vsLastMonth={1.2}
              icon="revenue"
              iconBg={METRIC_COLORS.revenue}
              active={activeMetric === "revenue"}
              onIconClick={() =>
                setActiveMetric((p) => (p === "revenue" ? null : "revenue"))
              }
            />
            <KPI
              label="BIR SHARE"
              value="23.4%"
              vsYTD={1.2}
              vsLastMonth={0.4}
              icon="share"
              iconBg={METRIC_COLORS.share}
              active={activeMetric === "share"}
              onIconClick={() =>
                setActiveMetric((p) => (p === "share" ? null : "share"))
              }
            />
            <KPI
              label="PODS"
              value="415K"
              vsYTD={3.5}
              vsLastMonth={1.1}
              icon="pods"
              iconBg={METRIC_COLORS.pods}
              active={activeMetric === "pods"}
              onIconClick={() =>
                setActiveMetric((p) => (p === "pods" ? null : "pods"))
              }
            />
            <KPI
              label="TAPS"
              value="92.7K"
              vsYTD={1.9}
              vsLastMonth={-0.6}
              icon="taps"
              iconBg={METRIC_COLORS.taps}
              active={activeMetric === "taps"}
              onIconClick={() =>
                setActiveMetric((p) => (p === "taps" ? null : "taps"))
              }
            />
            <KPI
              label="DISPLAYS"
              value="128K"
              vsYTD={5.1}
              vsLastMonth={2.3}
              icon="displays"
              iconBg={METRIC_COLORS.displays}
              active={activeMetric === "displays"}
              onIconClick={() =>
                setActiveMetric((p) => (p === "displays" ? null : "displays"))
              }
            />
            <KPI
              label="AVD"
              value="7.8"
              vsYTD={0.9}
              vsLastMonth={0.3}
              icon="avd"
              iconBg={METRIC_COLORS.avd}
              active={activeMetric === "avd"}
              onIconClick={() =>
                setActiveMetric((p) => (p === "avd" ? null : "avd"))
              }
            />
            <KPI
              label="AD SHARE"
              value="18.6%"
              vsYTD={-0.8}
              vsLastMonth={-0.4}
              icon="adshare"
              iconBg={METRIC_COLORS.adshare}
              active={activeMetric === "adshare"}
              onIconClick={() =>
                setActiveMetric((p) => (p === "adshare" ? null : "adshare"))
              }
            />
          </div>

          {/* ================= TREND DRAWER ================= */}
          {activeMetric && (
            <div
              style={{
                backgroundColor: METRIC_COLORS[activeMetric],
                borderRadius: "16px",
                padding: "1.5rem",
                height: 260,
                minWidth: 0,
              }}
            >
              <TrendChart title="Latest Weeks" data={volumeTrend} />
            </div>
          )}

          {/* ================= GEO + BRAND ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(520px, 1fr))",
              gap: "1.5rem",
              minWidth: 0,
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 10px 24px rgba(10,22,51,0.10)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                minHeight: 520,
                minWidth: 0,
              }}
            >
              <USHeatmap onSelectState={() => {}} />
              <div
                className="subtle-scroll"
                style={{ flex: 1, overflowY: "auto", minWidth: 0 }}
              >
                <RegionMatrix selectedMetric={activeMetric} />
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 10px 24px rgba(10,22,51,0.10)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                minHeight: 520,
                minWidth: 0,
              }}
            >
              <div
                className="subtle-scroll"
                style={{ flex: 1, overflowY: "auto", minWidth: 0 }}
              >
                <BrandMatrix selectedMetric={activeMetric} />
              </div>
            </div>
          </div>

          {/* ✅ Dummy sections */}
          {EXEC_DUMMY_SECTIONS.map((sec) => (
            <div key={sec.title} className="exec-section-card">
              <div className="exec-section-title">{sec.title}</div>
              <div className="exec-section-subtitle">{sec.subtitle}</div>

              <div className="exec-section-body">
                <div className="exec-note">
                  <div style={{ fontWeight: 900, letterSpacing: "0.10em" }}>
                    Summary
                  </div>
                  <ul>
                    {sec.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="exec-filler">Additional content</div>
              </div>
            </div>
          ))}

          {/* ✅ GUARANTEED scroll spacer for debugging */}
          <div
            style={{
              height: 1200,
              borderRadius: 16,
              border: "1px dashed rgba(10,22,51,0.25)",
              background: "rgba(255,255,255,0.55)",
              display: "grid",
              placeItems: "center",
              opacity: 0.85,
            }}
          >
            <div
              style={{
                fontWeight: 900,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontSize: "0.78rem",
              }}
            >
              Scroll Test Spacer (remove after validation)
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
