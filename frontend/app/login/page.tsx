"use client";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 p-6">
            <LoginForm className="w-full max-w-sm" />
        </div>
    );
}
