import { apiRequest } from "@/lib/api-client";

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    role: string;
    token_type: string;
}

export const authService = {
    login: (email: string) =>
        apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),

    verifyOtp: (email: string, otp: string) =>
        apiRequest<AuthResponse>("/auth/verify", {
            method: "POST",
            body: JSON.stringify({ email, otp }),
        }),

    resendOtp: (email: string) =>
        apiRequest("/auth/resend", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),

    logout: () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
    }
};
