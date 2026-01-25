"use client";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

export interface SuccessResponse<T = any> {
    status: string;
    message: string;
    data: T;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<SuccessResponse<T>> {
    const isClient = typeof window !== "undefined";
    const token = isClient ? localStorage.getItem("access_token") : null;

    // Diagnostic logging (first 10 chars of token for traceability without full disclosure)
    if (isClient) {
        console.log(`[API] ${options.method || 'GET'} ${endpoint} | Token present: ${!!token} ${token ? `(${token.slice(0, 10)}...)` : ''}`);
    }

    const headers = new Headers(options.headers || {});

    // Set default Content-Type if not provided
    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    // Set Authorization header if token exists and is valid
    if (token && token !== "null" && token !== "undefined") {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const result = await response.json().catch(() => ({
        status: "error",
        message: "An unexpected error occurred"
    }));

    if (!response.ok) {
        console.error(`[API Error] ${endpoint} | Status: ${response.status} | Message: ${result.message}`);

        // Handle token expiration or invalid authentication
        if (response.status === 401 && isClient) {
            console.warn("[Auth] Token expired or invalid. Logging out...");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_role");

            // Redirect to view page
            window.location.href = "/view";
        }

        throw new Error(result.message || response.statusText);
    }

    return result as SuccessResponse<T>;
}
