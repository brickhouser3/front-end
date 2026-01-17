import React, { useState, useEffect, useMemo } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { BarChart3, DollarSign, Percent, MapPin, Droplet, LayoutGrid, Gauge, Megaphone, ChevronRight, Layers } from "lucide-react";
import { useDashboard, BRAND_CODES } from "../context/DashboardContext";
import { useDrillState } from "./DrillEngine";

type BrandMatrixProps = { selectedMetric?: string | null; };

// ✅ METRIC CONFIGURATION
const ADDITIVE_KPIS = ["volume", "revenue", "pods", "taps", "displays"];

const formatValue = (val: number, kpiKey: string) => {
    if (val === null || val === undefined || isNaN(val) || val === 0) return "-";
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

const BRAND_LOGOS: Record<string, string> = { "BDL": "BDL.jpg", "BHL": "BHL.jpg", "MUL": "MUL.jpg", "BUD": "BUD.jpg", "STA": "STA.jpg", "NUTRL": "NUTRL.png", "KGA": "KGA.png", "CWFM": "CWFM.jpg", "AO": "AO_logo_placeholder.png" }; // Placeholder for AO logo if missing

const KPI_CONFIG = [
  { key: "volume", label: "Volume", icon: BarChart3 }, { key: "revenue", label: "Net Rev", icon: DollarSign },
  { key: "share", label: "Share", icon: Percent }, { key: "adshare", label: "Ad Share", icon: Megaphone },
  { key: "pods", label: "PODs", icon: MapPin }, { key: "taps", label: "TAPs", icon: Droplet },
  { key: "avd", label: "AVD", icon: Gauge }, { key: "displays", label: "Displays", icon: LayoutGrid },
];

const columnCellStyle: React.CSSProperties = { width: "100%", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.15 };

// --- SUB-LEVEL RENDERER ---
const DrillLevel = ({ kpi, groupBy, parentFilters, activeBrandCols, gridLayout }: any) => {
    const { filters, selectedPeriod, timeScope, includeAO } = useDashboard();
    const [rows, setRows] = useState<{name: string, data: number[]}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchData = async (brandFilter?: string) => {
            const anchor = getAnchorMonth(selectedPeriod);
            const body: any = { 
                contract_version: "kpi_request.v1", 
                kpi, 
                groupBy, 
                max_month: anchor, 
                scope: timeScope, 
                filters: { ...filters, ...parentFilters, include_ao: includeAO } 
            };
            if(brandFilter) body.filters.megabrand = [brandFilter];

            try {
                const res = await fetch("https://ci-capabilities-api.vercel.app/api/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const json = await res.json();
                const map: Record<string, number> = {};
                if (json.ok) json.result.data_array.forEach((r: string[]) => map[r[0]] = parseFloat(r[1]));
                return map;
            } catch { return {}; }
        };

        const load = async () => {
            setLoading(true);
            const brandMaps = await Promise.all(activeBrandCols.map((b: string) => fetchData(b)));
            const totalMap = await fetchData(); 

            if (!mounted) return;

            const allKeys = new Set(Object.keys(totalMap));
            activeBrandCols.forEach((_, i) => Object.keys(brandMaps[i]).forEach(k => allKeys.add(k)));

            const isAdditive = ADDITIVE_KPIS.includes(kpi);

            const finalRows = Array.from(allKeys).map(key => {
                let rowSum = 0;
                const colValues = activeBrandCols.map((_, i) => {
                    const val = brandMaps[i][key] || 0;
                    rowSum += val;
                    return val;
                });

                // HYBRID TOTAL
                const totalVal = isAdditive ? rowSum : (totalMap[key] || 0);
                
                colValues.push(totalVal);
                return { name: key, data: colValues };
            });

            setRows(finalRows.sort((a,b) => b.data[b.data.length-1] - a.data[a.data.length-1]));
            setLoading(false);
        };
        load();
        return () => { mounted = false; };
    }, [kpi, groupBy, JSON.stringify(selectedPeriod), timeScope, JSON.stringify(filters), includeAO, activeBrandCols]);

    if (loading) return <div style={{ padding: "8px 0 8px 40px", fontSize: "0.7rem", color: "#94a3b8" }}>Loading details...</div>;

    return (
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {rows.map((r, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: gridLayout, gap: 4, padding: "6px 0", borderTop: idx===0 ? "none" : "1px dashed #e2e8f0" }}>
                    <div style={{ paddingLeft: 40, fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{r.name}</div>
                    {r.data.map((val, i) => (
                        <div key={i} style={{ textAlign: "center", fontSize: "0.75rem", color: "#64748b" }}>{formatValue(val, kpi)}</div>
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ================= MAIN COMPONENT ================= */
export default function BrandMatrix({ selectedMetric }: BrandMatrixProps) {
  const { filters, selectedPeriod, timeScope, includeAO } = useDashboard(); // ✅ includeAO
  const drill = useDrillState();
  const baseUrl = useBaseUrl("/");
  const [drillLevel, setDrillLevel] = useState("region");
  const [kpiRows, setKpiRows] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);

  // ✅ DYNAMIC COLUMNS (Include AO if toggled)
  const activeBrandCols = useMemo(() => {
      const base = ["BDL", "BHL", "MUL", "BUD", "STA", "NUTRL", "KGA", "CWFM"];
      if (includeAO) base.push("AO");
      return base;
  }, [includeAO]);

  // ✅ DYNAMIC GRID
  const gridLayout = useMemo(() => 
      `115px repeat(${activeBrandCols.length}, minmax(60px, 1fr)) 75px`, 
  [activeBrandCols]);

  useEffect(() => {
      let mounted = true;
      const fetchTopLevel = async () => {
          setLoading(true);
          const anchor = getAnchorMonth(selectedPeriod);

          const fetchKpiTotals = async (kpi: string) => {
             const commonFilters = { ...filters, include_ao: includeAO };
             const bodyBrand = { contract_version: "kpi_request.v1", kpi, groupBy: "megabrand", max_month: anchor, scope: timeScope, filters: commonFilters };
             const bodyTotal = { contract_version: "kpi_request.v1", kpi, groupBy: "total", max_month: anchor, scope: timeScope, filters: commonFilters };
             
             try {
                 const [resBrand, resTotal] = await Promise.all([
                     fetch("https://ci-capabilities-api.vercel.app/api/query", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(bodyBrand) }),
                     fetch("https://ci-capabilities-api.vercel.app/api/query", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(bodyTotal) })
                 ]);
                 const jsonBrand = await resBrand.json();
                 const jsonTotal = await resTotal.json();

                 const brandMap: Record<string, number> = {};
                 if(jsonBrand.ok) jsonBrand.result.data_array.forEach((r: string[]) => brandMap[r[0]] = parseFloat(r[1]));
                 
                 const rowData = activeBrandCols.map(b => brandMap[b] || 0);

                 // HYBRID TOTAL
                 let grandTotal = 0;
                 if (ADDITIVE_KPIS.includes(kpi)) {
                     grandTotal = rowData.reduce((sum, val) => sum + val, 0);
                 } else {
                     grandTotal = jsonTotal.ok && jsonTotal.result.data_array.length > 0 ? parseFloat(jsonTotal.result.data_array[0][1]) : 0;
                 }

                 rowData.push(grandTotal);
                 return rowData;
             } catch { return []; }
          };

          const allData: Record<string, number[]> = {};
          await Promise.all(KPI_CONFIG.map(async (k) => { allData[k.key] = await fetchKpiTotals(k.key); }));

          if(mounted) { setKpiRows(allData); setLoading(false); }
      };
      fetchTopLevel();
      return () => { mounted = false; };
  }, [JSON.stringify(selectedPeriod), timeScope, JSON.stringify(filters), includeAO, activeBrandCols]);

  return (
    <div style={{ padding: "0.5rem", height: "100%", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif", overflowX: "auto" }}>
        
        {/* CONTROLS */}
        <div style={{ display: "flex", gap: 12, padding: "8px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", alignItems: "center", minWidth: "fit-content" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                <Layers size={14} /> Drill Dimension:
            </div>
            <select value={drillLevel} onChange={(e) => setDrillLevel(e.target.value)} style={{ fontSize: "0.75rem", padding: "4px", borderRadius: 4, border: "1px solid #cbd5e1" }}>
                <option value="region">Region</option>
                <option value="state">State</option>
                <option value="channel">Channel</option>
                <option value="wholesaler">Wholesaler</option>
            </select>
        </div>

        {/* HEADERS */}
        <div style={{ display: "grid", gridTemplateColumns: gridLayout, gap: 4, padding: "8px 0", borderBottom: "2px solid #e2e8f0", alignItems: "end", background: "white", position: "sticky", top: 0, zIndex: 10, minWidth: "fit-content" }}>
            <div style={{fontWeight: 700, fontSize: "0.7rem", color: "#94a3b8", paddingLeft: 8}}>METRIC / DRILL</div>
            {activeBrandCols.map(b => (
                <div key={b} style={{ display: "flex", justifyContent: "center" }}>
                    {BRAND_LOGOS[b] ? (
                        <img src={`${baseUrl}img/brand_logos/${BRAND_LOGOS[b]}`} style={{ height: 28, objectFit: "contain" }} alt={b} />
                    ) : (
                        <span style={{fontSize: "0.8rem", fontWeight: 700, color: "#475569"}}>{b}</span>
                    )}
                </div>
            ))}
            <div style={{ fontWeight: 800, textAlign: "center", fontSize: "0.75rem", color: "#1e293b" }}>TOTAL</div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: "auto", minWidth: "fit-content" }}>
            {!loading && KPI_CONFIG.map(kpi => {
                const values = kpiRows[kpi.key] || [];
                const isExpanded = drill.isOpen(kpi.key);
                return (
                    <React.Fragment key={kpi.key}>
                        <div onClick={() => drill.toggle(kpi.key)} style={{ display: "grid", gridTemplateColumns: gridLayout, gap: 4, padding: "10px 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: isExpanded ? "#f1f5f9" : "white" }}>
                            <div style={{ paddingLeft: 8, fontWeight: 700, fontSize: "0.8rem", color: "#334155", display: "flex", alignItems: "center", gap: 8 }}>
                                <ChevronRight size={14} style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                                <div style={{display: "flex", alignItems: "center", gap: 6}}><kpi.icon size={14} className="text-slate-400" />{kpi.label}</div>
                            </div>
                            {values.map((val, i) => (
                                <div key={i} style={{ textAlign: "center", fontSize: i===values.length-1 ? "0.85rem" : "0.8rem", fontWeight: i===values.length-1 ? 800 : 600, color: i===values.length-1 ? "#0f172a" : "#475569" }}>
                                    {formatValue(val, kpi.key)}
                                </div>
                            ))}
                        </div>
                        {isExpanded && <DrillLevel kpi={kpi.key} groupBy={drillLevel} parentFilters={{}} activeBrandCols={activeBrandCols} gridLayout={gridLayout} />}
                    </React.Fragment>
                );
            })}
        </div>
    </div>
  );
}