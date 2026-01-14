import React, { useMemo, useState } from "react";
import AppLayout from "../../components/AppLayout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import SupportUI from "../../components/page_ui/support";

export type TestResult = {
  name: string;
  ok: boolean;
  status: number;
  ms: number;
  url: string;
  responseHeaders: Record<string, string>;
  raw: string;
  json: any | null;
  error?: string;
};

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function runFetch(
  name: string,
  url: string,
  init?: RequestInit
): Promise<TestResult> {
  const start = performance.now();

  try {
    const res = await fetch(url, init);
    const ms = Math.round(performance.now() - start);

    const raw = await res.text();
    const json = safeJsonParse(raw);
    const headersObj = Object.fromEntries(res.headers.entries());

    return {
      name,
      ok: res.ok,
      status: res.status,
      ms,
      url,
      responseHeaders: headersObj,
      raw,
      json,
      error: res.ok ? undefined : raw,
    };
  } catch (err: any) {
    const ms = Math.round(performance.now() - start);
    return {
      name,
      ok: false,
      status: 0,
      ms,
      url,
      responseHeaders: {},
      raw: "",
      json: null,
      error: err?.message ?? "Failed to fetch",
    };
  }
}

export default function SupportPage() {
  const { siteConfig } = useDocusaurusContext();

  // ✅ Single source of truth: MUST be full endpoint, e.g.
  // https://ci-capabilities-api.vercel.app/api/query
  const apiQueryUrl = (siteConfig.customFields as any)?.apiQueryUrl as
    | string
    | undefined;

  const endpoint = useMemo(() => {
    if (!apiQueryUrl) return "";
    // Trim trailing slashes but DO NOT append any paths here
    return apiQueryUrl.trim().replace(/\/+$/, "");
  }, [apiQueryUrl]);

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  async function runAllTests() {
    if (!endpoint) {
      setResults([
        {
          name: "Config error",
          ok: false,
          status: 0,
          ms: 0,
          url: "(missing)",
          responseHeaders: {},
          raw: "",
          json: null,
          error:
            "customFields.apiQueryUrl is not configured (expected full URL ending with /api/query)",
        },
      ]);
      return;
    }

    setRunning(true);
    setResults([]);

    const next: TestResult[] = [];

    // 1) GET health — hits endpoint directly
    next.push(
      await runFetch("GET (health)", endpoint, {
        method: "GET",
        headers: { Accept: "application/json" },
      })
    );
    setResults([...next]);

    // 2) POST ping — transport only
    next.push(
      await runFetch("POST ping (transport only)", endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ping: true,
          requestedAt: new Date().toISOString(),
        }),
      })
    );
    setResults([...next]);

    // 3) POST KPI — Databricks roundtrip
    next.push(
      await runFetch("POST kpi_request.v1 (volume)", endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          contract_version: "kpi_request.v1",
          kpi: "volume",
        }),
      })
    );
    setResults([...next]);

    setRunning(false);
  }

  return (
    <AppLayout>
      <SupportUI
        apiUrl={endpoint || "(missing apiQueryUrl)"}
        running={running}
        results={results}
        onRunTests={runAllTests}
      />
    </AppLayout>
  );
}
