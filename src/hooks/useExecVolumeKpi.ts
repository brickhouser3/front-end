import { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { KpiResponseV1 } from "../contracts/kpi";

/**
 * Fetches the Exec Volume KPI from the Vercel API
 * Uses Docusaurus customFields.apiBaseUrl
 */
export function useExecVolumeKpi() {
  const { siteConfig } = useDocusaurusContext();
  const apiBaseUrl = (siteConfig.customFields as any)?.apiBaseUrl;

  const [data, setData] = useState<KpiResponseV1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔥 useExecVolumeKpi mounted");
    console.log("🌐 apiBaseUrl:", apiBaseUrl);

    if (!apiBaseUrl) {
      setError("API base URL is not configured");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchKpi() {
      try {
        setLoading(true);
        console.log("🚀 Fetching volume KPI...");

        const res = await fetch(`${apiBaseUrl}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract_version: "kpi_request.v1",
            kpi: "volume",
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch volume KPI (${res.status})`);
        }

        const json: KpiResponseV1 = await res.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Unknown error");
          console.error("❌ Volume KPI error:", err);
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
  }, [apiBaseUrl]);

  return { data, loading, error };
}
