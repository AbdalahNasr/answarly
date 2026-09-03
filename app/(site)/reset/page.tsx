"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import GradientLoader from "@/components/gradient-loader"
import Link from "next/link"
import ReactBitsGalaxy from "@/components/ui/react-bits-galaxy"

function ResetPasswordForm() {
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [noToken, setNoToken] = useState(false)

    useEffect(() => {
        if (!token) {
            setNoToken(true)
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "Please make sure both passwords match.",
                variant: "destructive",
            })
            return
        }

        if (password.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/auth/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast({
                    title: "Error",
                    description: data?.error || "Reset link may be expired or invalid.",
                    variant: "destructive",
                })
                return
            }
            setSuccess(true)
            toast({
                title: "Password reset",
                description: "Your password has been updated successfully.",
            })
            setTimeout(() => router.push("/login"), 3000)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Please try again",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-white">
                    {success
                        ? "Password updated"
                        : noToken
                            ? "Invalid link"
                            : "Reset your password"}
                </CardTitle>
                <p className="text-sm text-white/70 mt-1">
                    {success
                        ? "You can now sign in with your new password."
                        : noToken
                            ? "This reset link is missing or invalid."
                            : "Enter your new password below."}
                </p>
            </CardHeader>
            <CardContent className="relative">
                {success ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-500/30 border border-green-400/40 flex items-center justify-center mb-4 backdrop-blur-sm">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                            <p className="text-sm text-white/70 text-center">
                                Redirecting to sign in...
                            </p>
                        </div>
                    </div>
                ) : noToken ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400/30 to-rose-500/30 border border-red-400/40 flex items-center justify-center mb-4 backdrop-blur-sm">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <p className="text-sm text-white/70 text-center">
                                Please request a new reset link from the forgot password page.
                            </p>
                        </div>
                        <Link href="/forgot" className="block">
                            <Button
                                variant="outline"
                                className="w-full bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white hover:bg-white/30"
                            >
                                Request new link
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white/90">
                                New password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white placeholder:text-white/70"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-white/90">
                                Confirm password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white placeholder:text-white/70"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Password strength indicator */}
                        {password.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-colors ${password.length >= level * 3
                                                ? level <= 1
                                                    ? "bg-red-400"
                                                    : level <= 2
                                                        ? "bg-orange-400"
                                                        : level <= 3
                                                            ? "bg-yellow-400"
                                                            : "bg-green-400"
                                                : "bg-white/10"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-white/50">
                                    {password.length < 6
                                        ? "Too short"
                                        : password.length < 8
                                            ? "Weak"
                                            : password.length < 12
                                                ? "Good"
                                                : "Strong"}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-600/90 hover:to-purple-600/90 backdrop-blur-md border border-white/30"
                            disabled={loading}
                        >
                            {loading ? <GradientLoader size={16} /> : <span>Reset password</span>}
                        </Button>
                    </form>
                )}

                {/* Back to login */}
                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to sign in
                    </Link>
                </div>
            </CardContent>
        </>
    )
}

export default function ResetPasswordPage() {
    return (
        <main className="h-[calc(100vh-64px)] relative flex items-center justify-center overflow-hidden">
            {/* Galaxy Background */}
            <div className="absolute inset-0 z-0">
                <ReactBitsGalaxy
                    mouseRepulsion={true}
                    mouseInteraction={true}
                    density={1.2}
                    glowIntensity={0.4}
                    saturation={0.6}
                    hueShift={240}
                    twinkleIntensity={0.5}
                    rotationSpeed={0.05}
                    repulsionStrength={8}
                    transparent={true}
                />
            </div>

            {/* Content */}
            <section className="relative z-10 w-full flex items-center justify-center h-full px-4">
                <div className="w-full max-w-md mx-auto">
                    <Card className="relative overflow-hidden rounded-2xl bg-white/10 dark:bg-black/20 border-white/30 dark:border-white/20 shadow-2xl backdrop-blur-md">
                        <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
                        <Suspense fallback={
                            <CardContent className="relative py-12 text-center">
                                <GradientLoader size={24} />
                                <p className="text-sm text-white/50 mt-4">Loading...</p>
                            </CardContent>
                        }>
                            <ResetPasswordForm />
                        </Suspense>
                    </Card>
                </div>
            </section>
        </main>
    )
}
