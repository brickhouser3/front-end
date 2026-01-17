// src/lib/apiClient.ts
/* =========================================================
   Mission Control — API Client
   - Typed request/response
   - Timeout via AbortController
   - Consistent error normalization
   - Small in-memory dedupe cache for fast perceived load
   - Uses text/plain by default (matches your current working setup)
========================================================= */

export type ApiOk<T> = {
  ok: true;
  result: T;
  meta?: Record<string, unknown>;
};

export type ApiErr = {
  ok: false;
  error: {
    message: string;
    code?: string;
    status?: number;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiOk<T> | ApiErr;

export type ApiClientOptions = {
  timeoutMs?: number;
  headers?: Record<string, string>;
  dedupe?: boolean;
};

// Simple in-memory request dedupe (same payload => same promise)
const inFlight = new Map<string, Promise<any>>();

function stableKey(url: string, body: unknown) {
  return `${url}::${JSON.stringify(body)}`;
}

async function parseJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export function createApiClient(endpointUrl: string, defaults?: ApiClientOptions) {
  const timeoutDefault = defaults?.timeoutMs ?? 12_000;

  async function post<TReq extends object, TRes>(
    body: TReq,
    opts?: ApiClientOptions
  ): Promise<ApiResponse<TRes>> {
    const url = endpointUrl;
    const dedupe = opts?.dedupe ?? true;
    const key = stableKey(url, body);

    if (dedupe && inFlight.has(key)) return inFlight.get(key)!;

    const run = (async () => {
      const controller = new AbortController();
      const timeoutMs = opts?.timeoutMs ?? timeoutDefault;
      const id = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            // ✅ Keep as text/plain to match your current working implementation
            "Content-Type": "text/plain",
            Accept: "application/json",
            ...(defaults?.headers ?? {}),
            ...(opts?.headers ?? {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const json = await parseJsonSafe(res);

        if (!res.ok) {
          const message =
            (json && (json.error?.message || json.message || json.error)) ||
            `Request failed (${res.status})`;

          return {
            ok: false,
            error: { message, status: res.status, details: json },
          } satisfies ApiErr;
        }

        // Preferred wrapper: { ok, result, meta? }
        if (json && typeof json.ok === "boolean") {
          if (json.ok) {
            return {
              ok: true,
              result: json.result as TRes,
              meta: json.meta,
            } satisfies ApiOk<TRes>;
          }
          return {
            ok: false,
            error: {
              message: json.error?.message || json.error || "API returned ok:false",
              details: json,
            },
          } satisfies ApiErr;
        }

        // Fallback: treat as OK payload
        return { ok: true, result: json as TRes } satisfies ApiOk<TRes>;
      } catch (e: any) {
        const msg =
          (e?.name === "AbortError" || `${e?.message || ""}`.toLowerCase().includes("abort"))
            ? "Request timed out"
            : e?.message || "Request failed";

        return { ok: false, error: { message: msg, details: e } } satisfies ApiErr;
      } finally {
        clearTimeout(id);
        if (dedupe) inFlight.delete(key);
      }
    })();

    if (dedupe) inFlight.set(key, run);
    return run;
  }

  return { post };
}
