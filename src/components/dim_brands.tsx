import React, { useMemo, useState, useEffect } from "react";
import { formatBBLs } from "../lib/format"; // Ensure you have this helper or replace with inline formatter

/* ======================================================
   LOCAL HOOK: useBrandRanking
   Fetches data grouped by Brand instead of Time
====================================================== */
function useBrandRanking(kpi: string, period: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchRanking() {
      setLoading(true);
      try {
        const res = await fetch("https://ci-capabilities-api.vercel.app/api/query", {
          method: "POST",
          body: JSON.stringify({
            contract_version: "kpi_request.v1",
            kpi: kpi || "volume",
            groupBy: "megabrand", // <--- THIS triggers the new API logic
            filters: {
              // We intentionally DON'T pass the brand filter here 
              // because we usually want to see ALL brands in the matrix
              // regardless of the dropdown selection (or pass it if you want to drill down)
            }
          })
        });
        const json = await res.json();
        if (mounted && json.ok && json.result?.data_array) {
           // Transform [Brand, Cy, Ly] -> Object
           const rows = json.result.data_array.map((r: string[]) => ({
             brand: r[0],
             val_cy: parseFloat(r[1]),
             val_ly: parseFloat(r[2])
           }));
           setData(rows);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if(mounted) setLoading(false);
      }
    }
    fetchRanking();
    return () => { mounted = false; };
  }, [kpi]); // Re-fetch when metric changes

  return { data, loading };
}

/* ======================================================
   COMPONENT
====================================================== */
export default function BrandMatrix({ selectedMetric = "volume" }: { selectedMetric: string | null }) {
  const metric = selectedMetric || "volume";
  
  // Fetch Data
  const { data, loading } = useBrandRanking(metric, "202512");

  // Formatters
  const formatVal = (val: number) => {
    if (metric === "revenue") return `$${(val/1e6).toFixed(1)}M`;
    return formatBBLs ? formatBBLs(val) : val.toLocaleString();
  };

  // Sort & Max for bars
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.val_cy - a.val_cy);
  }, [data]);

  const maxVal = sortedData[0]?.val_cy || 1;

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Matrix...</div>;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">
          {metric} by Brand
        </h3>
        <span className="text-xs text-slate-400 font-mono">TOP PERFORMANCE</span>
      </div>

      <div className="flex-1 overflow-auto pr-2">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-white z-10 border-b border-slate-100 text-xs text-slate-400 uppercase">
             <tr>
               <th className="text-left py-2 pl-2">Brand</th>
               <th className="text-right py-2">Current</th>
               <th className="text-right py-2">vs LY</th>
               <th className="text-left py-2 w-24 pl-4">Trend</th>
             </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const diff = row.val_cy - row.val_ly;
              const pct = row.val_ly === 0 ? 0 : (diff / row.val_ly) * 100;
              const isPos = pct >= 0;

              return (
                <tr key={row.brand} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="py-3 pl-2 text-sm font-bold text-slate-700">
                    {row.brand}
                  </td>
                  <td className="py-3 text-right text-sm font-mono text-slate-600">
                    {formatVal(row.val_cy)}
                  </td>
                  <td className={`py-3 text-right text-xs font-bold ${isPos ? "text-green-600" : "text-red-500"}`}>
                    {isPos ? "+" : ""}{pct.toFixed(1)}%
                  </td>
                  <td className="py-3 pl-4">
                     {/* Mini Bar Visual */}
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isPos ? "bg-blue-500" : "bg-amber-500"}`} 
                          style={{ width: `${Math.min((row.val_cy / maxVal) * 100, 100)}%` }}
                        />
                     </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {data.length === 0 && !loading && (
           <div className="text-center py-10 text-slate-400 text-sm">No Data Available</div>
        )}
      </div>
    </div>
  );
}