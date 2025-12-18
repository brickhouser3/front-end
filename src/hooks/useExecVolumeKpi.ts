import { useEffect, useState } from "react";
import { KpiResponseV1 } from "../contracts/kpi";

export function useExecVolumeKpi() {
  const [data, setData] = useState<KpiResponseV1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchKpi() {
      try {
        setLoading(true);

        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract_version: "kpi_request.v1",
            kpi: "volume",
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch volume KPI");
        }

        const json: KpiResponseV1 = await res.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchKpi();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
