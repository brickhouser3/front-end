// src/hooks/useExecKpis.ts
import { useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { createApiClient } from "../lib/apiClient";

/* ======================================================
   Types (minimal v1)
====================================================== */

export type Timeframe = "MTD" | "QTD" | "YTD";
export type CompareTo = "LY";

export type KpiKey =
  | "volume"
  | "revenue"
  | "share"
  | "pods"
  | "taps"
  | "displays"
  | "avd"
  | "adshare";

export type KpiRequestV1 = {
  contract_version: "kpi_request.v1";
  kpi: KpiKey;
  timeframe?: Timeframe;
  compare_to?: CompareTo;
  as_of_week_end?: string; // YYYY-MM-DD (optional)
  // filters?: {} // reserved for later (region/channel/brand/etc.)
};

// What we WANT to standardize toward (but we also support your current data_array)
export type KpiResponseShapeV1 = {
  kpi?: KpiKey;
  timeframe?: Timeframe;
  uom?: string;

  // executive-ready numbers
  cy?: number | null;
  ly?: number | null;
  delta?: number | null;
  delta_pct?: number | null;

  // legacy fallback: raw scalar
  value?: number | null;

  // or Databricks-like payloads
  data_array?: any[][];
};

export type ExecKpiValue = {
  value: number | null; // keep your current UI happy (value-only)
  // reserved for next step (vs LY etc.)
  cy?: number | null;
  ly?: number | null;
  delta?: number | null;
  delta_pct?: number | null;
  uom?: string;
};

type State = {
  data: ExecKpiValue | null;
  loading: boolean;
  error: string | null;
};

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

function normalizeKpiResult(result: any): ExecKpiValue {
  // ✅ If API returns exec-ready fields
  if (result && (typeof result.cy !== "undefined" || typeof result.value !== "undefined")) {
    const value =
      typeof result.value !== "undefined"
        ? result.value
        : typeof result.cy !== "undefined"
          ? result.cy
          : null;

    return {
      value: value ?? null,
      cy: result.cy ?? null,
      ly: result.ly ?? null,
      delta: result.delta ?? null,
      delta_pct: result.delta_pct ?? null,
      uom: result.uom,
    };
  }

  // ✅ Legacy: Databricks wrapper { data_array: [[<scalar>]] }
  const scalar = result?.data_array?.[0]?.[0] ?? null;
  return { value: scalar };
}

/* ======================================================
   Single KPI hook (v1)
====================================================== */

export function useExecKpi(req: Omit<KpiRequestV1, "contract_version">): State {
  const { siteConfig } = useDocusaurusContext();
  const custom = siteConfig.customFields as any;

  // ✅ Preferred: full endpoint already includes /api/query
  const apiProdQueryUrl = custom?.apiProdQueryUrl as string | undefined;

  // ✅ Backward-compatible: base url that needs /api/query appended
  const apiBaseUrl = custom?.apiBaseUrl as string | undefined;

  const endpoint =
    apiProdQueryUrl ||
    (apiBaseUrl ? joinUrl(apiBaseUrl, "api/query") : undefined);

  const client = useMemo(() => (endpoint ? createApiClient(endpoint) : null), [endpoint]);

  const payload: KpiRequestV1 = useMemo(
    () => ({
      contract_version: "kpi_request.v1",
      timeframe: "YTD",
      compare_to: "LY",
      ...req,
    }),
    [req]
  );

  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!client) {
      setState({
        data: null,
        loading: false,
        error: "API endpoint is not configured (customFields.apiProdQueryUrl or apiBaseUrl)",
      });
      return;
    }

    let cancelled = false;

    async function run() {
      setState((s) => ({ ...s, loading: true, error: null }));

      const res = await client.post<KpiRequestV1, any>(payload, {
        timeoutMs: 12_000,
        dedupe: true,
      });

      if (cancelled) return;

      if (!res.ok) {
        setState({ data: null, loading: false, error: res.error.message || "Request failed" });
        return;
      }

      // Your server wrapper: { ok, result: { ... } }
      const normalized = normalizeKpiResult(res.result);

      setState({ data: normalized, loading: false, error: null });
    }

    run().catch((e: any) => {
      if (cancelled) return;
      setState({
        data: null,
        loading: false,
        error: e?.message || "Unknown error",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [client, payload]);

  return state;
}

/* ======================================================
   Convenience hooks (start with Volume)
====================================================== */

export function useExecVolumeKpi(opts?: { timeframe?: Timeframe; as_of_week_end?: string }) {
  return useExecKpi({
    kpi: "volume",
    timeframe: opts?.timeframe ?? "YTD",
    as_of_week_end: opts?.as_of_week_end,
  });
}
