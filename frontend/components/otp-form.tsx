"use client";

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GalleryVerticalEnd, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || "your email"

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length < 6) {
            toast.error("Please enter the 6-digit code")
            return
        }

        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Identity verified!")
            router.push("/")
        }, 1000)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleVerify}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                <GalleryVerticalEnd className="size-6" />
                            </div>
                        </div>
                        <h1 className="text-xl font-bold">Enter verification code</h1>
                        <FieldDescription>
                            We sent a 6-digit code to <span className="font-semibold text-slate-900">{email}</span>
                        </FieldDescription>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="otp" className="sr-only">
                            Verification code
                        </FieldLabel>
                        <div className="flex justify-center flex-col items-center gap-4">
                            <InputOTP
                                maxLength={6}
                                id="otp"
                                required
                                containerClassName="gap-4"
                                value={otp}
                                onChange={(v) => setOtp(v)}
                                disabled={isLoading}
                            >
                                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            <FieldDescription className="text-center">
                                Didn&apos;t receive the code? <a href="#" className="text-blue-600 hover:underline">Resend</a>
                            </FieldDescription>
                        </div>
                    </Field>
                    <Field>
                        <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold" disabled={isLoading || otp.length < 6}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify"
                            )}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    )
}
