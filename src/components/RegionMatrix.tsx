import React, { useState, useEffect } from "react";
import { BarChart3, DollarSign, Percent, MapPin, Droplet, LayoutGrid, Gauge, Megaphone, ChevronRight } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useDrillState } from "./DrillEngine";

type RegionMatrixProps = { selectedMetric?: string | null; };

type RowData = {
    id: string; 
    name: string; 
    level: "region" | "state" | "wholesaler";
    data: Record<string, { value: number; delta: number }>;
};

/* ================= LAYOUT CONSTANTS ================= */
const FIRST_COL_WIDTH = "220px";
const COLUMN_GAP = "0.4rem";
const ROW_PADDING_Y = "0.6rem";
const MATRIX_GRID = (kpiCount: number) => `${FIRST_COL_WIDTH} repeat(${kpiCount}, minmax(0, 1fr))`;

const columnCellStyle: React.CSSProperties = {
  width: "100%", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.15,
};

const kpis = [
  { key: "volume", label: "Volume", icon: BarChart3 },
  { key: "revenue", label: "Net Rev", icon: DollarSign },
  { key: "share", label: "Share", icon: Percent },
  { key: "adshare", label: "Ad Share", icon: Megaphone },
  { key: "pods", label: "PODs", icon: MapPin },
  { key: "taps", label: "TAPs", icon: Droplet },
  { key: "avd", label: "AVD", icon: Gauge },
  { key: "displays", label: "Displays", icon: LayoutGrid },
];

const REGION_NAMES: Record<string, string> = { 
    "01": "Region 1", "02": "Region 2", "03": "Region 3", "04": "Region 4", 
    "05": "Region 5", "06": "Region 6", "07": "Region 7", "08": "Region 8" 
};

/* ================= HELPERS ================= */

// 1. Get Anchor Month
const getAnchorMonth = (periods: string[]) => {
    if (!periods || periods.length === 0) return "202512";
    return [...periods].sort().reverse()[0];
};

// 2. Smart Formatting (Consistent with BrandMatrix)
const formatValue = (val: number, kpiKey: string) => {
    if (val === null || val === undefined || isNaN(val) || val === 0) return "-";
    const abs = Math.abs(val);

    // Percentages & Averages
    if (kpiKey.includes("share") || kpiKey === "adshare") return `${val.toFixed(1)}%`;
    if (kpiKey === "avd") return val.toFixed(1);

    // Revenue
    if (kpiKey === "revenue") {
        if (abs >= 1.0e9) return `$${(val / 1.0e9).toFixed(1)}B`;
        if (abs >= 1.0e6) return `$${(val / 1.0e6).toFixed(1)}M`;
        if (abs >= 1.0e3) return `$${(val / 1.0e3).toFixed(0)}K`;
        return `$${val.toFixed(0)}`;
    }

    // Counts
    if (abs >= 1.0e9) return `${(val / 1.0e9).toFixed(1)}B`;
    if (abs >= 1.0e6) return `${(val / 1.0e6).toFixed(1)}M`;
    if (abs >= 1.0e3) return `${(val / 1.0e3).toFixed(0)}K`;

    return val.toFixed(0);
};

/* ================= RECURSIVE ROW RENDERER ================= */
const MatrixLevel = ({ level, groupBy, parentFilters, pathPrefix, drill, selectedMetric, hoverCol, setHoverCol }: any) => {
    // ✅ Consuming includeAO
    const { filters: globalFilters, selectedPeriod, timeScope, includeAO } = useDashboard(); 
    const [rows, setRows] = useState<RowData[]>([]);
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
                        groupBy, 
                        max_month: anchor, 
                        scope: timeScope, // ✅ Respect YTD/MTD
                        filters: { 
                            ...globalFilters, 
                            ...parentFilters,
                            include_ao: includeAO // ✅ Respect AO Toggle
                        }
                    })
                });
                const json = await res.json();
                const result: Record<string, { cy: number, ly: number }> = {};
                if(json.ok) json.result.data_array.forEach((r: string[]) => {
                    result[r[0]] = { cy: parseFloat(r[1]), ly: parseFloat(r[2]) };
                });
                return result;
            } catch (e) { return {}; }
        };

        const load = async () => {
            setLoading(true);
            const results = await Promise.all(kpis.map(k => fetchKpi(k.key)));
            
            if (!mounted) return;

            // Merge Data
            const allKeys = new Set<string>();
            results.forEach(res => Object.keys(res).forEach(k => allKeys.add(k)));

            const finalRows: RowData[] = Array.from(allKeys).map(key => {
                const rowData: any = {};
                kpis.forEach((kpi, idx) => {
                    const d = results[idx][key];
                    if (!d) { rowData[kpi.key] = { value: 0, delta: 0 }; return; }
                    
                    const delta = d.ly === 0 ? 0 : ((d.cy - d.ly) / d.ly) * 100;
                    rowData[kpi.key] = { value: d.cy, delta };
                });

                return {
                    id: key,
                    name: level === "region" ? (REGION_NAMES[key] || key) : key,
                    level,
                    data: rowData
                };
            });

            // Sort Alphabetically by Name
            setRows(finalRows.sort((a, b) => a.name.localeCompare(b.name)));
            setLoading(false);
        };

        load();
        return () => { mounted = false; };
    }, [JSON.stringify(selectedPeriod), timeScope, JSON.stringify(globalFilters), JSON.stringify(parentFilters), includeAO]);

    if (loading) return <div style={{ padding: "8px", paddingLeft: "40px", fontSize: "0.75rem", color: "#94a3b8" }}>Loading {level}s...</div>;

    return (
        <>
            {rows.map(row => {
                const currentPath = pathPrefix ? `${pathPrefix}|${level}:${row.id}` : `${level}:${row.id}`;
                const isExpanded = drill.isOpen(currentPath);
                const indent = level === "region" ? 0 : level === "state" ? 20 : 40;
                
                return (
                    <React.Fragment key={row.id}>
                        {/* ROW RENDER */}
                        <div 
                            onClick={() => level !== "wholesaler" && drill.toggle(currentPath)}
                            style={{ 
                                display: "grid", gridTemplateColumns: MATRIX_GRID(kpis.length), gap: COLUMN_GAP, padding: `${ROW_PADDING_Y} 0.5rem`, 
                                borderBottom: "1px solid #f1f5f9", cursor: level !== "wholesaler" ? "pointer" : "default",
                                background: isExpanded ? "#f8fafc" : "white"
                            }}
                        >
                            <div style={{ paddingLeft: indent, fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6, color: "#334155" }}>
                                {level !== "wholesaler" && <ChevronRight size={14} style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />}
                                {level === "wholesaler" && <div style={{width: 14}} />} 
                                {row.name}
                            </div>
                            {kpis.map((kpi, idx) => {
                                const cell = row.data[kpi.key];
                                const isFaded = selectedMetric && selectedMetric !== kpi.key;
                                return (
                                    <div key={kpi.key} style={{ ...columnCellStyle, opacity: isFaded ? 0.35 : 1, background: hoverCol === idx ? "rgba(59,130,246,0.04)" : "transparent" }} onMouseEnter={() => setHoverCol(idx)} onMouseLeave={() => setHoverCol(null)}>
                                        <div style={{ fontWeight: 600, fontSize: ".85rem" }}>
                                            {formatValue(cell.value, kpi.key)}
                                        </div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 600, color: cell.delta > 0 ? "#166534" : cell.delta < 0 ? "#b91c1c" : "#6b7280" }}>
                                            {cell.delta > 0 ? "+" : ""}{cell.delta.toFixed(1)}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* RECURSIVE CHILD RENDER */}
                        {isExpanded && level === "region" && (
                            <MatrixLevel 
                                level="state" 
                                groupBy="state" 
                                parentFilters={{ region: [row.id] }} 
                                pathPrefix={currentPath} 
                                drill={drill} 
                                selectedMetric={selectedMetric}
                                hoverCol={hoverCol}
                                setHoverCol={setHoverCol}
                            />
                        )}
                        {isExpanded && level === "state" && (
                            <MatrixLevel 
                                level="wholesaler" 
                                groupBy="wholesaler" 
                                parentFilters={{ ...parentFilters, state: [row.id] }} 
                                pathPrefix={currentPath} 
                                drill={drill} 
                                selectedMetric={selectedMetric}
                                hoverCol={hoverCol}
                                setHoverCol={setHoverCol}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};

/* ================= MAIN EXPORT ================= */
export default function RegionMatrix({ selectedMetric }: RegionMatrixProps) {
  const drill = useDrillState();
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  return (
    <div style={{ padding: "0.25rem", fontFamily: "Inter, sans-serif", height: "100%", overflowY: "auto", overflowX: "clip" }}>
      
      {/* HEADERS */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "white", borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ display: "grid", gridTemplateColumns: MATRIX_GRID(kpis.length), gap: COLUMN_GAP, padding: `${ROW_PADDING_Y} 0.5rem` }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Hierarchy</div>
          {kpis.map((kpi, idx) => (
            <div key={kpi.key} style={{ display: "flex", justifyContent: "center", background: hoverCol === idx ? "rgba(59,130,246,0.06)" : "transparent" }} onMouseEnter={() => setHoverCol(idx)} onMouseLeave={() => setHoverCol(null)}>
              <div style={columnCellStyle}>
                <kpi.icon size={13} className="text-slate-500" />
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", marginTop: "2px" }}>{kpi.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP LEVEL (REGIONS) */}
      <MatrixLevel 
        level="region" 
        groupBy="region" 
        parentFilters={{}} 
        pathPrefix="" 
        drill={drill} 
        selectedMetric={selectedMetric} 
        hoverCol={hoverCol} 
        setHoverCol={setHoverCol} 
      />
    </div>
  );
}