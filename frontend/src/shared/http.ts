const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

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
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {})
        },
        ...init
    });

    let payload: unknown = null;

    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const message = getErrorMessage(payload) ?? `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload as T;
}
