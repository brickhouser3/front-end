import { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { ApiQueryResponse } from "../contracts/api";
import type { ExecKpiValue } from "../contracts/execKpi";

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

export function useExecVolumeKpi() {
  const { siteConfig } = useDocusaurusContext();
  const apiBaseUrl = (siteConfig.customFields as any)?.apiBaseUrl as
    | string
    | undefined;

  const [data, setData] = useState<ExecKpiValue | null>(null);
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

        const url = joinUrl(apiBaseUrl, "api/query");

        // Keep your "simple request" approach if you want:
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            Accept: "application/json",
          },
          body: JSON.stringify({
            contract_version: "kpi_request.v1",
            kpi: "volume",
          }),
        });

        const text = await res.text();
        const raw: ApiQueryResponse | null = (() => {
          try {
            return text ? JSON.parse(text) : null;
          } catch {
            return null;
          }
        })();

        if (!res.ok) {
          const msg =
            (raw as any)?.error ||
            (raw as any)?.message ||
            (text ? text.slice(0, 180) : `Request failed (${res.status})`);
          throw new Error(msg);
        }

        if (!raw || (raw as any).ok === false) {
          throw new Error((raw as any)?.error ?? "API error");
        }

        const value = (raw as any)?.result?.data_array?.[0]?.[0] ?? null;

        if (!cancelled) setData({ value });
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
