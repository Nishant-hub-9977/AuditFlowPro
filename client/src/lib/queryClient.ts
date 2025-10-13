import { QueryClient, QueryFunction } from "@tanstack/react-query";

type PendingRequest = {
  method: string;
  url: string;
  data?: unknown;
  resolve: (value: Response | PromiseLike<Response>) => void;
  reject: (reason?: unknown) => void;
};

const pendingRequests: PendingRequest[] = [];
let offlineQueueInitialized = false;

function initOfflineQueue() {
  if (offlineQueueInitialized || typeof window === "undefined") {
    return;
  }
  offlineQueueInitialized = true;

  window.addEventListener("online", () => {
    const queued = [...pendingRequests];
    pendingRequests.length = 0;

    queued.forEach((request) => {
      apiRequest(request.method, request.url, request.data)
        .then(request.resolve)
        .catch(request.reject);
    });
  });
}

function logApiError(method: string, url: string, res: Response, body: string) {
  const requestId = res.headers.get("x-request-id") ?? "n/a";
  const timestamp = new Date().toISOString();
  console.groupCollapsed(`[API Error] ${method.toUpperCase()} ${url}`);
  console.log("timestamp", timestamp);
  console.log("status", res.status, res.statusText);
  console.log("requestId", requestId);
  if (body) {
    console.log("body", body);
  }
  console.trace("stack trace");
  console.groupEnd();
}

async function throwIfResNotOk(res: Response, context: { method: string; url: string }) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    logApiError(context.method, context.url, res, text);
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export function getApiBaseUrl(): string {
  const envBase =
    (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_API_BASE_URL as string)) ||
    (typeof process !== "undefined" ? (process.env.VITE_API_BASE_URL as string) : "");
  return envBase ? envBase.replace(/\/$/, "") : "";
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base || path.startsWith("http")) {
    return path;
  }
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Allow the Vite dev server to proxy to the API by using VITE_API_BASE_URL when provided.
  const fullUrl = buildUrl(url);

  if (typeof window !== "undefined") {
    initOfflineQueue();
    if (!navigator.onLine && method.toUpperCase() !== "GET") {
      return new Promise<Response>((resolve, reject) => {
        pendingRequests.push({ method, url, data, resolve, reject });
      });
    }
  }

  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res, { method, url: fullUrl });
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const target = typeof queryKey[0] === "string" ? (queryKey[0] as string) : queryKey.join("/");
    const res = await fetch(buildUrl(target), {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res, { method: "GET", url: buildUrl(target) });
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
