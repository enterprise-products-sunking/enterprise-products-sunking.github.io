"use client";

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd, Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            toast.error("Please enter your email")
            return
        }

        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsLoading(false)
        router.push(`/otp?email=${encodeURIComponent(email)}`)
        toast.success("OTP sent to your email")
    }

    return (
        <div className="w-full h-screen grid lg:grid-cols-2 overflow-hidden">
            {/* Left Side - Form */}
            <div className="flex flex-col justify-center items-center p-6 bg-white relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm space-y-8"
                >
                    <div className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4"
                        >
                            <GalleryVerticalEnd className="h-6 w-6" />
                        </motion.div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
                        <p className="text-slate-500">Sign in to your shift management portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Sending Code...
                                </>
                            ) : (
                                <>
                                    Sign In with Email
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="pt-6 text-center text-xs text-slate-400">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Visuals */}
            <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50" />

                <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-20">
                    <div className="flex items-center gap-2 opacity-80">
                        <GalleryVerticalEnd className="h-6 w-6" />
                        <span className="font-semibold tracking-wide">ShiftSync</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="space-y-6"
                    >
                        <h2 className="text-4xl font-bold leading-tight max-w-lg">
                            Manage shifts with elegance and ease.
                        </h2>
                        <div className="space-y-4">
                            {[
                                "Smart scheduling algorithms",
                                "Instant shift swapping",
                                "Real-time team notifications"
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="flex items-center gap-3 text-blue-100"
                                >
                                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>
                                    <span>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="flex gap-4 opacity-60 text-sm">
                        <span>© 2026 ShiftSync Inc.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
