import { useState, useEffect } from "react";
import { useDashboard } from "../context/DashboardContext"; // ✅ Consume Context

type Option = { label: string; value: string };

export function useFilterOptions(dimension: string, table: string) {
  const { selectedPeriod } = useDashboard(); // ✅ Get the array
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchOptions = async () => {
      const BASE_URL = "https://ci-capabilities-api.vercel.app";

      try {
        const res = await fetch(`${BASE_URL}/api/filters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
              dimension, 
              table,
              // ✅ Pass the array safely. API filters.ts must handle this.
              months: selectedPeriod 
          })
        });

        const json = await res.json();
        
        if (mounted) {
            if (json.ok && Array.isArray(json.options)) {
                // Add "ALL" option
                const cleanOptions = [
                    { label: `All ${dimension === 'sls_regn_cd' ? 'Regions' : dimension === 'wslr_nbr' ? 'Wholesalers' : 'Items'}`, value: "ALL" }, 
                    ...json.options
                ];
                setOptions(cleanOptions);
            } else {
                setOptions([{ label: "No Data", value: "ALL" }]);
            }
        }
      } catch (e) {
        console.error(`[FilterAPI] Error ${dimension}`, e);
        if (mounted) setOptions([{ label: "Error", value: "ALL" }]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOptions();
    return () => { mounted = false; };
  }, [dimension, table, JSON.stringify(selectedPeriod)]); // Re-run when time changes

  return { options, loading };
}