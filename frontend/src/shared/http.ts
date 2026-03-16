const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

function normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildUrl(path: string): string {
    const normalizedBaseUrl = normalizeBaseUrl(API_BASE_URL);
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBaseUrl}${normalizedPath}`;
}

function getErrorMessage(payload: unknown): string | null {
    if (typeof payload === "object" && payload !== null && "message" in payload) {
        const value = (payload as { message?: unknown }).message;
        if (typeof value === "string" && value.length > 0) {
            return value;
        }
    }

    return null;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const url = buildUrl(path);
    const normalizedBaseUrl = normalizeBaseUrl(API_BASE_URL);
    let response: Response;

    try {
        response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...(init?.headers ?? {})
            },
            ...init
        });
    } catch {
        throw new Error(`Cannot reach API at ${url}. Ensure the backend server is running.`);
    }

    let payload: unknown = null;

    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const hasPayloadMessage = getErrorMessage(payload) !== null;
        const proxyBackendUnavailable =
            normalizedBaseUrl === "/api" &&
            [500, 502, 503, 504].includes(response.status) &&
            !hasPayloadMessage;

        if (proxyBackendUnavailable) {
            throw new Error("Cannot reach backend at http://localhost:4000. Start backend with 'npm.cmd run dev' in /backend.");
        }

        const message = getErrorMessage(payload) ?? `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload as T;
}
