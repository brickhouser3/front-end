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

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
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
  const customFields = (siteConfig.customFields as any) || {};

  // ✅ Preferred: explicit full endpoint
  const apiProdQueryUrl = customFields.apiProdQueryUrl as string | undefined; // "https://.../api/query"

  // ✅ Fallback: base URL host
  const apiBaseUrl = customFields.apiBaseUrl as string | undefined; // "https://...vercel.app"

  // ✅ Final safety fallback so localhost never bricks
  const hardcoded = "https://ci-capabilities-api.vercel.app/api/query";

  const endpoint = useMemo(() => {
    if (apiProdQueryUrl && apiProdQueryUrl.trim()) {
      return apiProdQueryUrl.trim().replace(/\/+$/, "");
    }
    if (apiBaseUrl && apiBaseUrl.trim()) {
      return joinUrl(apiBaseUrl.trim(), "api/query");
    }
    return hardcoded;
  }, [apiProdQueryUrl, apiBaseUrl]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "(ssg)";

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  async function runAllTests() {
    setRunning(true);
    setResults([]);

    const next: TestResult[] = [];

    // 1) GET health
    next.push(
      await runFetch("GET (health)", endpoint, {
        method: "GET",
        headers: { Accept: "application/json" },
        // ✅ Avoid opaque caching surprises
        cache: "no-store",
      })
    );
    setResults([...next]);

    // 2) POST ping (transport only)
    next.push(
      await runFetch("POST ping (transport only)", endpoint, {
        method: "POST",
        headers: {
          // ✅ Keep it simple. JSON is fine because our API handles OPTIONS properly.
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ping: true,
          requestedAt: new Date().toISOString(),
          origin,
        }),
      })
    );
    setResults([...next]);

    // 3) POST KPI request
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
        apiUrl={endpoint}
        origin={origin}
        running={running}
        results={results}
        onRunTests={runAllTests}
      />
    </AppLayout>
  );
}
