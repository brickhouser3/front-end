import React, { useState, useMemo } from "react";
import AppLayout from "../../components/AppLayout";
import { useDashboard } from "../../context/DashboardContext"; 

import USHeatmap from "../../components/USHeatmap";
import RegionMatrix from "../../components/RegionMatrix";
import BrandMatrix from "../../components/BrandMatrix";

import KPI from "../../components/KPI"; // Check casing matches your file (KPI.tsx vs kpi.tsx)
import TrendChart from "../../components/TrendChart";
import { 
  TrendingDown, 
  TrendingUp, 
  Sparkles
} from "lucide-react";

import { useKpiQuery } from "../../hooks/useKpis";

/* ================= CONFIG ================= */
const METRIC_COLORS: Record<string, string> = {
  volume: "#DCE7FF", revenue: "#D6F4F1", share: "#DDF5E6", pods: "#FFE8CC",
  taps: "#FFE1E1", displays: "#EFE3FF", avd: "#E9EEF5", adshare: "#F6E1FA",
};

const EXEC_UPDATES = [
  { label: "Volume", text: "Down vs LY driven by Midwest softness.", icon: TrendingDown, tone: "amber" as const },
  { label: "Share", text: "BIR share expanding in Grocery.", icon: TrendingUp, tone: "gold" as const },
  { label: "Execution", text: "Displays outperforming plan.", icon: Sparkles, tone: "navy" as const },
];

/* ================= HELPERS ================= */
const formatTrend = (val: number | undefined) => (val === undefined || isNaN(val)) ? 0 : val.toFixed(1);

const formatMoney = (val: number) => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  return `$${val.toLocaleString()}`;
};

const formatCount = (val: number) => {
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
  return val.toLocaleString();
};

const formatBBLs = (val: number) => formatCount(val); // Reuse logic
const formatPct = (val: number) => `${val.toFixed(1)}%`;
const formatDecimal = (val: number) => val.toFixed(1);

/* ================= INTERNAL CONTENT COMPONENT ================= */
function ExecutiveSummaryContent() {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  
  // ✅ FIXED: Hooks must be called INSIDE the component
  const { filters, selectedPeriod, includeAO } = useDashboard();

  // DATA FETCHING
  // Note: We pass filters/period here because the hook signature expects them,
  // even though the hook calculates some internal logic.
  const { stats: vol, loading: volL } = useKpiQuery("volume", filters, selectedPeriod);
  const { stats: rev, loading: revL } = useKpiQuery("revenue", filters, selectedPeriod);
  const { stats: shr, loading: shrL } = useKpiQuery("share", filters, selectedPeriod);
  const { stats: pod, loading: podL } = useKpiQuery("pods", filters, selectedPeriod);
  const { stats: tap, loading: tapL } = useKpiQuery("taps", filters, selectedPeriod);
  const { stats: dsp, loading: dspL } = useKpiQuery("displays", filters, selectedPeriod);
  const { stats: avd, loading: avdL } = useKpiQuery("avd", filters, selectedPeriod);
  const { stats: ads, loading: adsL } = useKpiQuery("adshare", filters, selectedPeriod);

  // DYNAMIC CHART DATA
  const activeTrendData = useMemo(() => {
    switch(activeMetric) {
      case 'volume': return vol?.trendData;
      case 'revenue': return rev?.trendData;
      case 'share': return shr?.trendData;
      case 'pods': return pod?.trendData;
      case 'taps': return tap?.trendData;
      case 'displays': return dsp?.trendData;
      case 'avd': return avd?.trendData;
      case 'adshare': return ads?.trendData;
      default: return null;
    }
  }, [activeMetric, vol, rev, shr, pod, tap, dsp, avd, ads]);

  // HELPER: Loading State Wrapper
  const val = (loading: boolean, stats: any, formatter: (v: number) => string) => {
    if (loading) return "...";
    if (!stats) return "—";
    return formatter(stats.currentValue);
  };

  return (
    <>
      <style>{`
        .exec-scope { color: #0A1633; }
        .exec-update-shell { border-radius: 16px; padding: 1rem; border: 1px solid rgba(10,22,51,0.1); background: linear-gradient(180deg, rgba(247,249,252,0.92), rgba(247,249,252,0.78)); box-shadow: 0 12px 26px rgba(10,22,51,0.08), inset 0 1px 0 rgba(255,255,255,0.55); }
        .exec-update-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 0.85rem; }
        .exec-update-card { position: relative; display: flex; gap: 0.75rem; padding: 0.85rem; border-radius: 14px; background: rgba(255,255,255,0.65); border: 1px solid rgba(10,22,51,0.1); box-shadow: 0 10px 22px rgba(10,22,51,0.06), inset 0 1px 0 rgba(255,255,255,0.55); }
        .exec-update-rail { position:absolute; left:0; top:10px; bottom:10px; width:3px; border-radius:999px; }
        .tone-navy .exec-update-rail{ background: rgba(10,22,51,0.55); }
        .tone-amber .exec-update-rail{ background: rgba(245,158,11,0.70); }
        .tone-gold .exec-update-rail{ background: rgba(242,214,117,0.80); }
        .subtle-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .subtle-scroll::-webkit-scrollbar-track { background: transparent; }
        .subtle-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div className="exec-scope">
        <div style={{ width: "100%", padding: "0.9rem 1rem", minWidth: 0 }}>
            
          {/* UPDATES */}
          <div style={{ marginBottom: "1.15rem" }}>
            <div className="exec-update-shell">
              <div className="exec-update-grid">
                {EXEC_UPDATES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`exec-update-card tone-${item.tone}`}>
                      <div className="exec-update-rail" />
                      <Icon size={18} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800 }}>{item.label}</div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.78 }}>{item.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KPI CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.05rem", marginBottom: "1.15rem" }}>
            <KPI label="VOLUME" icon="volume" iconBg={METRIC_COLORS.volume} active={activeMetric === "volume"} onIconClick={() => setActiveMetric(p => p === "volume" ? null : "volume")}
              value={val(volL, vol, formatBBLs)} vsLastMonth={formatTrend(vol?.mtdPct)} vsYTD={formatTrend(vol?.ytdPct)}
              includeAO={includeAO} />
            <KPI label="NET REVENUE" icon="revenue" iconBg={METRIC_COLORS.revenue} active={activeMetric === "revenue"} onIconClick={() => setActiveMetric(p => p === "revenue" ? null : "revenue")}
              value={val(revL, rev, formatMoney)} vsLastMonth={formatTrend(rev?.mtdPct)} vsYTD={formatTrend(rev?.ytdPct)}
              includeAO={includeAO} />
            <KPI label="BIR SHARE" icon="share" iconBg={METRIC_COLORS.share} active={activeMetric === "share"} onIconClick={() => setActiveMetric(p => p === "share" ? null : "share")}
              value={val(shrL, shr, formatPct)} vsLastMonth={formatTrend(shr?.mtdPct)} vsYTD={formatTrend(shr?.ytdPct)}
              includeAO={includeAO} />
            <KPI label="PODS" icon="pods" iconBg={METRIC_COLORS.pods} active={activeMetric === "pods"} onIconClick={() => setActiveMetric(p => p === "pods" ? null : "pods")}
              value={val(podL, pod, formatCount)} vsLastMonth={formatTrend(pod?.mtdPct)} vsYTD={formatTrend(pod?.ytdPct)}
              includeAO={includeAO} />
            <KPI label="TAPS" icon="taps" iconBg={METRIC_COLORS.taps} active={activeMetric === "taps"} onIconClick={() => setActiveMetric(p => p === "taps" ? null : "taps")}
              value={val(tapL, tap, formatCount)} vsLastMonth={formatTrend(tap?.mtdPct)} vsYTD={formatTrend(tap?.ytdPct)}
              includeAO={includeAO} />
            <KPI label="DISPLAYS" icon="displays" iconBg={METRIC_COLORS.displays} active={activeMetric === "displays"} onIconClick={() => setActiveMetric(p => p === "displays" ? null : "displays")}
              value={val(dspL, dsp, formatCount)} vsLastMonth={formatTrend(dsp?.mtdPct)} vsYTD={formatTrend(dsp?.ytdPct)}
              includeAO={includeAO} />
            <KPI label="AVD" icon="avd" iconBg={METRIC_COLORS.avd} active={activeMetric === "avd"} onIconClick={() => setActiveMetric(p => p === "avd" ? null : "avd")}
              value={val(avdL, avd, formatDecimal)} vsLastMonth={formatTrend(avd?.mtdPct)} vsYTD={formatTrend(avd?.ytdPct)}
              includeAO={includeAO} />
            <KPI label="AD SHARE" icon="adshare" iconBg={METRIC_COLORS.adshare} active={activeMetric === "adshare"} onIconClick={() => setActiveMetric(p => p === "adshare" ? null : "adshare")}
              value={val(adsL, ads, formatPct)} vsLastMonth={formatTrend(ads?.mtdPct)} vsYTD={formatTrend(ads?.ytdPct)}
              includeAO={includeAO} />
          </div>

          {/* TRENDS */}
          {activeMetric && (
            <div style={{ backgroundColor: METRIC_COLORS[activeMetric], borderRadius: "16px", padding: "1.5rem", height: 280, marginBottom: "1.15rem" }}>
              {activeTrendData ? (
                <TrendChart title={`Monthly ${activeMetric.toUpperCase()} Trend`} data={activeTrendData} dataKey="value" />
              ) : (
                <div style={{height: "100%", display: "grid", placeItems: "center", opacity: 0.5}}>No trend data available</div>
              )}
            </div>
          )}

          {/* MATRICES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "1.5rem", marginBottom: "1.15rem" }}>
            
            {/* Left: Map + Region */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 10px 24px rgba(10,22,51,0.10)", padding: "1.25rem", minHeight: 520, display: "flex", flexDirection: "column" }}>
              {/* Heatmap takes up top portion */}
              <USHeatmap onSelectState={() => {}} />
              {/* Region Matrix fills remaining space */}
              <div className="subtle-scroll" style={{ flex: 1, overflowY: "auto", minWidth: 0, borderTop: "1px solid #e2e8f0", marginTop: 12, paddingTop: 12 }}>
                <RegionMatrix selectedMetric={activeMetric} />
              </div>
            </div>

            {/* Right: Brand Matrix */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 10px 24px rgba(10,22,51,0.10)", padding: "1.25rem", minHeight: 520, display: "flex", flexDirection: "column" }}>
              <div className="subtle-scroll" style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
                {/* Cleaned Props: No longer passes filters/period/scope, as it handles them internally */}
                <BrandMatrix selectedMetric={activeMetric} />
              </div>
            </div>

          </div>
            
        </div>
      </div>
    </>
  );
}

/* ================= EXPORTED PAGE WRAPPER ================= */
export default function ExecutiveSummaryUI() {
  return (
    <AppLayout>
      <ExecutiveSummaryContent />
    </AppLayout>
  );
}