"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle2, KeyRound, Link2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import GradientLoader from "@/components/gradient-loader"
import Link from "next/link"
import ReactBitsGalaxy from "@/components/ui/react-bits-galaxy"

type Step = "email" | "method" | "code" | "linkSent"

export default function ForgotPasswordPage() {
    const { toast } = useToast()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<Step>("email")

    // Code input state — 6 individual digits
    const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // ── Send request to backend ──
    const sendResetRequest = async (resetMethod: "link" | "code") => {
        setLoading(true)
        try {
            const res = await fetch("/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, method: resetMethod }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast({ title: "Error", description: data?.error || "Something went wrong", variant: "destructive" })
                return false
            }
            return true
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Please try again", variant: "destructive" })
            return false
        } finally {
            setLoading(false)
        }
    }

    // ── Step 1: Submit email → go to method choice ──
    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return
        setStep("method")
    }

    // ── Step 2: Choose method ──
    const handleChooseLink = async () => {
        const success = await sendResetRequest("link")
        if (success) {
            setStep("linkSent")
            toast({ title: "Link sent!", description: "Check your inbox for a reset link." })
        }
    }

    const handleChooseCode = async () => {
        const success = await sendResetRequest("code")
        if (success) {
            setStep("code")
            toast({ title: "Code sent!", description: "Check your inbox for a 6-digit code." })
        }
    }

    // ── Step 3 (code path): Verify code ──
    const handleVerifyCode = async () => {
        const code = digits.join("")
        if (code.length !== 6) {
            toast({ title: "Incomplete code", description: "Please enter all 6 digits.", variant: "destructive" })
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast({ title: "Invalid code", description: data?.error || "Code is wrong or expired.", variant: "destructive" })
                return
            }
            router.push(`/reset?token=${data.token}`)
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Please try again", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // ── Digit input handlers ──
    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const newDigits = [...digits]
        newDigits[index] = value.slice(-1)
        setDigits(newDigits)
        if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus()
        if (e.key === "Enter" && digits.every((d) => d)) handleVerifyCode()
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (pasted.length > 0) {
            const newDigits = [...digits]
            for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || ""
            setDigits(newDigits)
            inputRefs.current[Math.min(pasted.length, 5)]?.focus()
        }
    }

    const handleResend = async () => {
        setLoading(true)
        setDigits(["", "", "", "", "", ""])
        try {
            await fetch("/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, method: "code" }),
            })
            toast({ title: "Code resent!", description: "A new code has been sent to your email." })
        } catch { } finally { setLoading(false) }
    }

    // ── Titles & descriptions per step ──
    const titles: Record<Step, string> = {
        email: "Forgot password",
        method: "Choose reset method",
        code: "Enter verification code",
        linkSent: "Check your email",
    }

    const descriptions: Record<Step, React.ReactNode> = {
        email: "Enter your email to reset your password.",
        method: (
            <>How would you like to reset the password for <span className="font-medium text-white">{email}</span>?</>
        ),
        code: (
            <>We sent a 6-digit code to <span className="font-medium text-white">{email}</span></>
        ),
        linkSent: (
            <>We sent a reset link to <span className="font-medium text-white">{email}</span>. Click the button in the email to set a new password.</>
        ),
    }

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

                        <CardHeader className="relative">
                            <CardTitle className="text-2xl font-bold text-white">{titles[step]}</CardTitle>
                            <p className="text-sm text-white/70 mt-1">{descriptions[step]}</p>
                        </CardHeader>

                        <CardContent className="relative">
                            {/* ── Step: Email ── */}
                            {step === "email" && (
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-white/90">Email address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white placeholder:text-white/70"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-600/90 hover:to-purple-600/90 backdrop-blur-md border border-white/30"
                                    >
                                        Continue
                                    </Button>
                                </form>
                            )}

                            {/* ── Step: Method choice ── */}
                            {step === "method" && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleChooseLink}
                                        disabled={loading}
                                        className="w-full group relative rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md p-4 text-left transition-all hover:border-purple-400/40 disabled:opacity-50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/30">
                                                <Link2 className="h-5 w-5 text-indigo-300" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white text-sm">Send me a reset link</p>
                                                <p className="text-xs text-white/50 mt-0.5">Click the link in the email to reset your password directly</p>
                                            </div>
                                        </div>
                                        {loading && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm"><GradientLoader size={20} /></div>}
                                    </button>

                                    <button
                                        onClick={handleChooseCode}
                                        disabled={loading}
                                        className="w-full group relative rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md p-4 text-left transition-all hover:border-purple-400/40 disabled:opacity-50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-pink-500/30 border border-fuchsia-400/30">
                                                <KeyRound className="h-5 w-5 text-fuchsia-300" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white text-sm">Send me a verification code</p>
                                                <p className="text-xs text-white/50 mt-0.5">Enter a 6-digit code to verify and reset your password</p>
                                            </div>
                                        </div>
                                        {loading && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm"><GradientLoader size={20} /></div>}
                                    </button>

                                    <button
                                        onClick={() => setStep("email")}
                                        className="w-full text-xs text-zinc-400 hover:text-white transition-colors mt-2"
                                    >
                                        ← Change email
                                    </button>
                                </div>
                            )}

                            {/* ── Step: Code entry ── */}
                            {step === "code" && (
                                <div className="space-y-6">
                                    <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                        {digits.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { inputRefs.current[i] = el }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleDigitChange(i, e.target.value)}
                                                onKeyDown={(e) => handleDigitKeyDown(i, e)}
                                                autoFocus={i === 0}
                                                className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-white/15 dark:bg-white/10 border border-white/30 dark:border-white/20 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all backdrop-blur-md placeholder:text-white/30"
                                                placeholder="·"
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        onClick={handleVerifyCode}
                                        className="w-full bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-600/90 hover:to-purple-600/90 backdrop-blur-md border border-white/30"
                                        disabled={loading || digits.some((d) => !d)}
                                    >
                                        {loading ? <GradientLoader size={16} /> : <><KeyRound className="mr-2 h-4 w-4" />Verify code</>}
                                    </Button>

                                    <div className="flex items-center justify-between text-xs">
                                        <button type="button" onClick={handleResend} disabled={loading} className="text-purple-300 hover:text-white transition-colors disabled:opacity-50">
                                            Resend code
                                        </button>
                                        <button type="button" onClick={() => { setStep("method"); setDigits(["", "", "", "", "", ""]) }} className="text-zinc-400 hover:text-white transition-colors">
                                            Try different method
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step: Link sent confirmation ── */}
                            {step === "linkSent" && (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-500/30 border border-green-400/40 flex items-center justify-center mb-4 backdrop-blur-sm">
                                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                                        </div>
                                        <p className="text-sm text-white/70 text-center">
                                            Click the <strong className="text-white">Reset Password</strong> button in the email.
                                            <br />
                                            <span className="text-white/50">Don't see it? Check your spam folder.</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleChooseLink}
                                            variant="outline"
                                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                                            disabled={loading}
                                        >
                                            {loading ? <GradientLoader size={14} /> : "Resend"}
                                        </Button>
                                        <Button
                                            onClick={() => { setStep("method"); setDigits(["", "", "", "", "", ""]) }}
                                            variant="outline"
                                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                                        >
                                            Use code instead
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Back to login */}
                            <div className="mt-6 text-center">
                                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    )
}
