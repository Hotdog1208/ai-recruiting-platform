import { getApiUrl } from "@/lib/env";

export type BackendStatus = "unknown" | "ok" | "unreachable";

/** Thrown when API returns non-OK; includes status and optional details for UI. */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

let backendStatus: BackendStatus = "unknown";
const listeners = new Set<(s: BackendStatus) => void>();

export function getBackendStatus(): BackendStatus {
  return backendStatus;
}

export function subscribeBackendStatus(cb: (s: BackendStatus) => void): () => void {
  listeners.add(cb);
  cb(backendStatus);
  return () => listeners.delete(cb);
}

function setBackendStatus(s: BackendStatus) {
  if (s === backendStatus) return;
  backendStatus = s;
  listeners.forEach((cb) => cb(backendStatus));
}

const DEFAULT_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function fetchWithResilience(
  path: string,
  options?: RequestInit,
  token?: string | null,
  retries = DEFAULT_RETRIES
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${getApiUrl()}${path}`, { ...options, headers });
      setBackendStatus("ok");
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries - 1) {
        await new Promise((r) =>
          setTimeout(r, RETRY_DELAY_MS * (attempt + 1))
        );
      }
    }
  }
  setBackendStatus("unreachable");
  throw lastError ?? new Error("Request failed after retries");
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  token?: string | null
): Promise<T> {
  let res: Response;
  try {
    res = await fetchWithResilience(path, options, token);
  } catch (e) {
    throw new APIError(
      e instanceof Error ? e.message : "Network error. Check your connection.",
      0
    );
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const msg = err?.error?.message ?? err?.detail ?? res.statusText;
    const message = Array.isArray(msg) ? msg.join("; ") : String(msg);
    if (res.status === 401) {
      throw new APIError("Session expired. Please log in again.", 401, err);
    }
    if (res.status === 429) {
      throw new APIError("Too many requests. Please try again later.", 429, err);
    }
    throw new APIError(message, res.status, err);
  }
  return res.json();
}

export async function api<T>(
  path: string,
  options?: RequestInit,
  token?: string | null
): Promise<T> {
  return apiFetch<T>(path, options, token);
}

export const apiPost = <T>(path: string, body: unknown, token?: string | null) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) }, token);

export const apiPatch = <T>(path: string, body: unknown, token?: string | null) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token);

export const apiPut = <T>(path: string, body: unknown, token?: string | null) =>
  api<T>(path, { method: "PUT", body: JSON.stringify(body) }, token);

export const apiGet = <T>(path: string, token?: string | null) =>
  api<T>(path, undefined, token);

export const apiDelete = <T>(path: string, token?: string | null) =>
  api<T>(path, { method: "DELETE" }, token);

export async function apiUpload<T>(
  path: string,
  file: File,
  token?: string | null
): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${getApiUrl()}${path}`, {
      method: "POST",
      body: formData,
      headers,
    });
    setBackendStatus("ok");
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const msg = err?.error?.message ?? err?.detail ?? res.statusText;
      const message = Array.isArray(msg) ? msg.join("; ") : String(msg);
      if (res.status === 401) {
        throw new APIError("Session expired. Please log in again.", 401, err);
      }
      throw new APIError(message, res.status, err);
    }
    return res.json();
  } catch (e) {
    if (e instanceof APIError) throw e;
    if (e instanceof TypeError && e.message.includes("fetch")) {
      setBackendStatus("unreachable");
      throw new APIError("Network error. Check your connection.", 0);
    }
    throw e;
  }
}

export { getApiUrl } from "@/lib/env";
