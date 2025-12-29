import { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { KpiResponseV1 } from "../contracts/kpi";

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

/**
 * Fetches the Exec Volume KPI from the Vercel API
 * Normalizes Databricks SQL response → KpiResponseV1
 * Uses SIMPLE POST (text/plain) to avoid CORS preflight
 */
export function useExecVolumeKpi() {
  const { siteConfig } = useDocusaurusContext();
  const apiBaseUrl = (siteConfig.customFields as any)?.apiBaseUrl as
    | string
    | undefined;

  const [data, setData] = useState<KpiResponseV1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiBaseUrl) {
      setError("API base URL is not configured");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchKpi() {
      try {
        setLoading(true);
        setError(null);

        // ✅ Always build the correct endpoint
        const url = joinUrl(apiBaseUrl, "api/query");

        const res = await fetch(url, {
          method: "POST",
          headers: {
            // ✅ SIMPLE REQUEST → no CORS preflight
            "Content-Type": "text/plain",
            // ✅ Helps proxies/servers return JSON consistently
            Accept: "application/json",
          },
          body: JSON.stringify({
            contract_version: "kpi_request.v1",
            kpi: "volume",
          }),
        });

        // Try to parse JSON, but don't explode if a proxy returns HTML/text
        let raw: any = null;
        const text = await res.text();
        try {
          raw = text ? JSON.parse(text) : null;
        } catch {
          raw = null;
        }

        // ✅ Prefer API-provided error message if present
        if (!res.ok) {
          const msg =
            raw?.error ||
            raw?.message ||
            (text ? text.slice(0, 160) : `Request failed (${res.status})`);
          throw new Error(msg);
        }

        if (raw?.ok === false) {
          throw new Error(raw?.error ?? "API error");
        }

        const normalized: KpiResponseV1 = {
          value: raw?.result?.data_array?.[0]?.[0] ?? null,
        };

        if (!cancelled) setData(normalized);
      } catch (err: any) {
        if (!cancelled) {
          console.error("❌ useExecVolumeKpi error:", err);
          setError(err?.message ?? "Unknown error");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchKpi();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  return { data, loading, error };
}
