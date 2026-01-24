"use client";

import { Suspense } from "react";
import { OTPForm } from "@/components/otp-form";
import { Loader2 } from "lucide-react";

function OTPLoader() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );
}

export default function OTPPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 p-6">
            <Suspense fallback={<OTPLoader />}>
                <OTPForm className="w-full max-w-sm" />
            </Suspense>
        </div>
    );
}
