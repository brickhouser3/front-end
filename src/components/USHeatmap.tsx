import React, { useState, useEffect, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useDashboard } from "../context/DashboardContext"; 

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const FIPS_TO_STATE: Record<string, string> = { "01": "AL","02": "AK","04": "AZ","05": "AR","06": "CA","08": "CO","09": "CT","10": "DE", "11": "DC","12": "FL","13": "GA","15": "HI","16": "ID","17": "IL","18": "IN","19": "IA", "20": "KS","21": "KY","22": "LA","23": "ME","24": "MD","25": "MA","26": "MI","27": "MN", "28": "MS","29": "MO","30": "MT","31": "NE","32": "NV","33": "NH","34": "NJ","35": "NM", "36": "NY","37": "NC","38": "ND","39": "OH","40": "OK","41": "OR","42": "PA","44": "RI", "45": "SC","46": "SD","47": "TN","48": "TX","49": "UT","50": "VT","51": "VA","53": "WA", "54": "WV","55": "WI","56": "WY" };
const KPI_LABELS = { volume: "Vol", revenue: "Rev", share: "Share", adshare: "AdSh", pods: "PODs", taps: "TAPs", avd: "AVD", displays: "Disp" };

// ✅ SMART FORMATTER
const formatValue = (val: number, kpiKey: string) => {
    if (val === 0 || isNaN(val)) return "-";
    const abs = Math.abs(val);

    if (kpiKey.includes("share") || kpiKey === "adshare") return `${val.toFixed(1)}%`;
    if (kpiKey === "avd") return val.toFixed(1);

    if (kpiKey === "revenue") {
        if (abs >= 1.0e9) return `$${(val / 1.0e9).toFixed(1)}B`;
        if (abs >= 1.0e6) return `$${(val / 1.0e6).toFixed(1)}M`;
        if (abs >= 1.0e3) return `$${(val / 1.0e3).toFixed(0)}K`;
        return `$${val.toFixed(0)}`;
    }

    if (abs >= 1.0e9) return `${(val / 1.0e9).toFixed(1)}B`;
    if (abs >= 1.0e6) return `${(val / 1.0e6).toFixed(1)}M`;
    if (abs >= 1.0e3) return `${(val / 1.0e3).toFixed(0)}K`;

    return val.toFixed(0);
};

const getAnchorMonth = (periods: string[]) => {
    if (!periods || periods.length === 0) return "202512";
    return [...periods].sort().reverse()[0];
};

function useFullStateData() {
    const { filters, selectedPeriod, timeScope, includeAO } = useDashboard(); // ✅ includeAO
    const [data, setData] = useState<any>({});
    const [national, setNational] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchKpi = async (kpi: string) => {
            const anchor = getAnchorMonth(selectedPeriod);
            try {
                const res = await fetch("https://ci-capabilities-api.vercel.app/api/query", { 
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ 
                        contract_version: "kpi_request.v1", 
                        kpi, 
                        groupBy: "state", 
                        max_month: anchor, 
                        scope: timeScope, 
                        filters: { 
                            megabrand: filters.megabrand, 
                            wholesaler_id: filters.wslr_nbr, 
                            channel: filters.channel,
                            include_ao: includeAO // ✅ Pass AO
                        } 
                    }) 
                });
                const json = await res.json();
                const result: any = {};
                if (json.ok) json.result.data_array.forEach((row: string[]) => result[row[0]] = { val: parseFloat(row[1]), ly: parseFloat(row[2]) });
                return result;
            } catch { return {}; }
        };

        const load = async () => {
            setLoading(true);
            const kpis = Object.keys(KPI_LABELS);
            const results = await Promise.all(kpis.map(k => fetchKpi(k)));
            
            if (mounted) {
                const merged: any = {};
                const natAgg: any = {};
                kpis.forEach(k => natAgg[k] = { val: 0, ly: 0 });

                Object.values(FIPS_TO_STATE).forEach(state => {
                    merged[state] = {};
                    kpis.forEach((kpi, i) => {
                        const raw = results[i][state];
                        if (raw) {
                            natAgg[kpi].val += raw.val;
                            natAgg[kpi].ly += raw.ly;
                            merged[state][kpi] = raw;
                        } else {
                            merged[state][kpi] = { val: 0, ly: 0 };
                        }
                    });
                });
                
                if (natAgg['share']) { natAgg['share'].val /= 50; natAgg['share'].ly /= 50; }
                if (natAgg['adshare']) { natAgg['adshare'].val /= 50; natAgg['adshare'].ly /= 50; }
                if (natAgg['avd']) { natAgg['avd'].val /= 50; natAgg['avd'].ly /= 50; }

                setData(merged);
                setNational(natAgg);
                setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [JSON.stringify(selectedPeriod), timeScope, JSON.stringify(filters), includeAO]);

    return { data, national, loading };
}

function performanceColor(pct: number) {
  if (pct >= 0.05) return "#166534"; 
  if (pct >= 0) return "#4ade80"; 
  if (pct >= -0.05) return "#f87171"; 
  return "#991b1b"; 
}

export default function USHeatmap({ onSelectState }: { onSelectState?: (state: string) => void }) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const { data, national, loading } = useFullStateData();

  const activeData = hoveredState ? data[hoveredState] : national;
  const activeTitle = hoveredState ? `${hoveredState} Scorecard` : "National Total";

  return (
    <div style={{ width: "100%", height: "160px", marginBottom: "1.5rem", padding: "0.5rem", fontFamily: "Inter, sans-serif", position: "relative", boxSizing: "border-box" }}>
      <div style={{ display: "flex", height: "100%", gap: "1.5rem", alignItems: "flex-start" }}>
        
        {/* === LEFT: MAP === */}
        <div style={{ flex: "0 0 250px", height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-start" }}> 
           <div style={{ width: "100%", height: "100%" }}>
            <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "100%" }}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateCode = FIPS_TO_STATE[geo.id as string];
                    const st = data[stateCode]?.volume;
                    const pct = st && st.ly > 0 ? (st.val - st.ly) / st.ly : 0;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => stateCode && setHoveredState(stateCode)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => stateCode && onSelectState?.(stateCode)}
                        style={{
                          default: { fill: performanceColor(pct), outline: "none", stroke: "#fff", strokeWidth: 0.5 },
                          hover: { fill: "#1e40af", outline: "none", cursor: "pointer" },
                          pressed: { fill: "#1e3a8a", outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
           </div>
        </div>

        {/* === RIGHT: SCORECARD === */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem", background: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "8px 12px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 4 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", textTransform: "uppercase" }}>{activeTitle}</div>
                <div style={{ fontSize: "0.6rem", color: "#64748b", marginLeft: "auto" }}>{loading ? "Loading..." : "vs Last Year"}</div>
            </div>

            {!loading && activeData && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px 16px" }}>
                    {Object.keys(KPI_LABELS).map((kpi) => {
                        const m = activeData[kpi] || { val: 0, ly: 0 };
                        const pct = m.ly > 0 ? ((m.val - m.ly) / m.ly) * 100 : 0;
                        return (
                            <div key={kpi} style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.55rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{KPI_LABELS[kpi as keyof typeof KPI_LABELS]}</span>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{formatValue(m.val, kpi)}</span>
                                    <span style={{ fontSize: "0.6rem", fontWeight: 600, color: pct >= 0 ? "#166534" : "#991b1b" }}>
                                        {pct > 0 ? "+" : ""}{pct.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}