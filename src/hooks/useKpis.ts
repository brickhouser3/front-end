import { useState, useEffect, useMemo } from "react";
import { FilterState, useDashboard } from "../context/DashboardContext"; 

type ApiResult = {
  ok: boolean;
  result?: {
    data_array: string[][]; // [month, val_cy, val_ly]
  };
  error?: string;
};

export function useKpiQuery(
  kpi: string, 
  filters: FilterState,
  selectedPeriod?: string[]
) {
  // ✅ Consume Context for Scope & AO Toggle
  const { timeScope, includeAO } = useDashboard();
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchData() {
      setLoading(true);
      setError(null);
      const BASE_URL = "https://ci-capabilities-api.vercel.app";

      // Anchor Month Logic
      const anchorMonth = Array.isArray(selectedPeriod) && selectedPeriod.length > 0 
          ? [...selectedPeriod].sort().reverse()[0] 
          : "202512";

      try {
        const res = await fetch(`${BASE_URL}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract_version: "kpi_request.v1",
            kpi, 
            filters: {
                megabrand: filters.megabrand,
                region: filters.sls_regn_cd,       
                state: filters.mktng_st_cd,
                wholesaler_id: filters.wslr_nbr,
                channel: filters.channel,
                include_ao: includeAO // ✅ Pass AO Toggle
            },
            groupBy: "time",
            max_month: anchorMonth,
            scope: "YTD" // Always fetch YTD history for the sparkline
          }),
        });
        
        const json = await res.json();
        if (mounted) {
            if (!json.ok) throw new Error(json.error || "API Error");
            setData(json);
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, [kpi, JSON.stringify(filters), JSON.stringify(selectedPeriod), includeAO]); // ✅ Re-run on AO change

  // 2. Client-Side Math
  const stats = useMemo(() => {
    if (!data?.result?.data_array || data.result.data_array.length === 0) return null;

    const rows = data.result.data_array;
    const anchor = Array.isArray(selectedPeriod) && selectedPeriod.length > 0 
        ? [...selectedPeriod].sort().reverse()[0] 
        : "202512";

    // Find anchor row
    const activeRowIndex = rows.findIndex(r => r[0] === anchor);
    const finalIndex = activeRowIndex === -1 ? rows.length - 1 : activeRowIndex;
    const activeRow = rows[finalIndex];

    if (!activeRow) return null;

    // MTD Values (Single Month)
    const mtdCy = parseFloat(activeRow[1]);
    const mtdLy = parseFloat(activeRow[2]);
    const mtdDiff = mtdCy - mtdLy;
    const mtdPct = mtdLy === 0 ? 0 : (mtdDiff / mtdLy) * 100;

    // YTD Values (Sum Jan -> Anchor)
    let ytdCy = 0;
    let ytdLy = 0;
    for (let i = 0; i <= finalIndex; i++) {
      ytdCy += parseFloat(rows[i][1]);
      ytdLy += parseFloat(rows[i][2]);
    }
    
    const ytdDiff = ytdCy - ytdLy;
    const ytdPct = ytdLy === 0 ? 0 : (ytdDiff / ytdLy) * 100;

    // ✅ Toggle Logic: Which Value to Display as Main?
    const isAdditive = !["share", "adshare", "avd"].includes(kpi);
    let displayValue = mtdCy;
    
    if (timeScope === "YTD") {
        if (isAdditive) {
            displayValue = ytdCy; 
        } else {
            // For non-additive metrics in YTD, ideally backend provides average.
            // Fallback to MTD or simple average if needed.
            displayValue = mtdCy; 
        }
    }

    const trendData = rows.map(r => ({
      period: r[0],
      value: parseFloat(r[1]),
      value_ly: parseFloat(r[2])
    }));

    return {
      currentValue: displayValue,   
      mtdPct,                 
      ytdPct,                 
      ytdValue: ytdCy,       
      trendData,
      activePeriod: activeRow[0]
    };
  }, [data, selectedPeriod, timeScope, kpi]); 

  return { data, stats, loading, error };
}