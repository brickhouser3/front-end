import React from "react";
import { useHistory } from "react-router-dom";
import AppLayout from "../components/AppLayout";

import USHeatmap from "../components/USHeatmap";
import RegionMatrix from "../components/RegionMatrix";
import BrandMatrix from "../components/BrandMatrix";

import KPI from "../components/kpi";
import TrendChart from "../components/TrendChart";
import { volumeTrend } from "../lib/mockTrendData";
import { TrendingDown, TrendingUp, Sparkles } from "lucide-react";

import { useExecVolumeKpi } from "../hooks/useExecVolumeKpi";
import { formatBBLs, formatPctDecimal } from "../lib/format";

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

/* ======================================================
   PAGE
====================================================== */

export default function Exec() {
  const history = useHistory();
  const [activeMetric, setActiveMetric] = React.useState<string | null>(null);
  const { data: volumeKpi, loading: volumeLoading } = useExecVolumeKpi();

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

        /* ===== SUBTLE SCROLLBAR ===== */
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
      `}</style>

      {/* ================= FIXED VIEWPORT CANVAS ================= */}
      <div
        className="exec-scope"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F2F4F8",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            padding: "2rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1600px",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              minHeight: 0,
            }}
          >
            {/* ================= EXEC UPDATE ================= */}
            <div className="exec-update-shell">
              <div className="exec-update-grid">
                {EXEC_UPDATES.map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`exec-update-card tone-${item.tone}`}
                    >
                      <div className="exec-update-rail" />
                      <Icon size={18} />
                      <div>
                        <div style={{ fontWeight: 800 }}>{item.label}</div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.78 }}>
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
                gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                gap: "1.25rem",
              }}
            >
<KPI
  label="VOLUME"
  icon="volume"
  iconBg={METRIC_COLORS.volume}
  active={activeMetric === "volume"}
  onIconClick={() => setActiveMetric(p => (p === "volume" ? null : "volume"))}
  value={
    volumeLoading || !volumeKpi
      ? "—"
      : formatBBLs(volumeKpi.data.value)
  }
  vsYTD={
    volumeLoading || !volumeKpi
      ? 0
      : formatPctDecimal(volumeKpi.data.vs_ytd_pct)
  }
  vsLastMonth={
    volumeLoading || !volumeKpi
      ? 0
      : formatPctDecimal(volumeKpi.data.vs_mom_pct)
  }
/>

              <KPI label="NET REVENUE" value="$1.2B" vsYTD={4.8} vsLastMonth={1.2} vsTarget={0.9}
                icon="revenue" iconBg={METRIC_COLORS.revenue}
                active={activeMetric === "revenue"}
                onIconClick={() => setActiveMetric(p => (p === "revenue" ? null : "revenue"))}
              />
              <KPI label="BIR SHARE" value="23.4%" vsYTD={1.2} vsLastMonth={0.4} vsTarget={0.6}
                icon="share" iconBg={METRIC_COLORS.share}
                active={activeMetric === "share"}
                onIconClick={() => setActiveMetric(p => (p === "share" ? null : "share"))}
              />
              <KPI label="PODS" value="415K" vsYTD={3.5} vsLastMonth={1.1} vsTarget={2.4}
                icon="pods" iconBg={METRIC_COLORS.pods}
                active={activeMetric === "pods"}
                onIconClick={() => setActiveMetric(p => (p === "pods" ? null : "pods"))}
              />
              <KPI label="TAPS" value="92.7K" vsYTD={1.9} vsLastMonth={-0.6} vsTarget={-1.1}
                icon="taps" iconBg={METRIC_COLORS.taps}
                active={activeMetric === "taps"}
                onIconClick={() => setActiveMetric(p => (p === "taps" ? null : "taps"))}
              />
              <KPI label="DISPLAYS" value="128K" vsYTD={5.1} vsLastMonth={2.3} vsTarget={3.8}
                icon="displays" iconBg={METRIC_COLORS.displays}
                active={activeMetric === "displays"}
                onIconClick={() => setActiveMetric(p => (p === "displays" ? null : "displays"))}
              />
              <KPI label="AVD" value="7.8" vsYTD={0.9} vsLastMonth={0.3} vsTarget={0.4}
                icon="avd" iconBg={METRIC_COLORS.avd}
                active={activeMetric === "avd"}
                onIconClick={() => setActiveMetric(p => (p === "avd" ? null : "avd"))}
              />
              <KPI label="AD SHARE" value="18.6%" vsYTD={-0.8} vsLastMonth={-0.4} vsTarget={-1.2}
                icon="adshare" iconBg={METRIC_COLORS.adshare}
                active={activeMetric === "adshare"}
                onIconClick={() => setActiveMetric(p => (p === "adshare" ? null : "adshare"))}
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
                  flexShrink: 0,
                }}
              >
                <TrendChart title="Latest Weeks" data={volumeTrend} />
              </div>
            )}

            {/* ================= GEO + BRAND ================= */}
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                minHeight: 0,
              }}
            >
              {/* LEFT CARD */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 10px 24px rgba(10,22,51,0.10)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                <USHeatmap height={240} legendSize="compact" />
                <div className="subtle-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                  <RegionMatrix selectedMetric={activeMetric} />
                </div>
              </div>

              {/* RIGHT CARD */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 10px 24px rgba(10,22,51,0.10)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                <div className="subtle-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                  <BrandMatrix selectedMetric={activeMetric} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
