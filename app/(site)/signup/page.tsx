"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/components/i18n"
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import GradientLoader from "@/components/gradient-loader"
import Link from "next/link"
import ReactBitsGalaxy from "@/components/ui/react-bits-galaxy"
import { Github } from "lucide-react"

function SignupPageContent() {
  const { dict } = useI18n()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarBase64, setAvatarBase64] = useState("")
  const [avatarFilename, setAvatarFilename] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  const oauth = async (provider: "google" | "github") => {
    setLoading(true)
    setMessage("")
    try {
      const csrfRes = await fetch("/api/auth/csrf")
      const { csrfToken } = await csrfRes.json()

      const form = document.createElement("form")
      form.method = "POST"
      form.action = `/api/auth/signin/${provider}`

      const csrfInput = document.createElement("input")
      csrfInput.type = "hidden"
      csrfInput.name = "csrfToken"
      csrfInput.value = csrfToken
      form.appendChild(csrfInput)

      const callbackInput = document.createElement("input")
      callbackInput.type = "hidden"
      callbackInput.name = "callbackUrl"
      callbackInput.value = "/"
      form.appendChild(callbackInput)

      document.body.appendChild(form)
      form.submit()
    } catch (err: any) {
      setLoading(false)
      toast({ title: "OAuth error", description: err.message || "Could not connect", variant: "destructive" })
    }
  }

  useEffect(() => {
    const prefilledEmail = searchParams.get("email")
    if (prefilledEmail) {
      setEmail(prefilledEmail)
    }

    // Force-clear any autofilled values that some browsers persistentely inject
    setUsername('')
    try {
      const userEl = document.querySelector('input#username') as HTMLInputElement | null
      if (userEl) {
        userEl.value = ''
        userEl.blur()
      }
    } catch {}
  }, [searchParams])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const body: any = { username, email, password }
      if (avatarBase64 && avatarFilename) {
        body.avatarBase64 = avatarBase64
        body.avatarFilename = avatarFilename
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error || data?.message || 'Registration failed'
        // Friendly guidance when email already exists
        const lower = String(msg || '').toLowerCase()
        if (lower.includes('email already')) {
          toast({ title: 'Email already registered', description: 'That email is already in use — try logging in or reset your password.', variant: 'destructive' })
        } else {
          toast({ title: 'Registration failed', description: msg, variant: 'destructive' })
        }
        setMessage(msg)
        return
      }
      // persist user locally and show toast
      try { localStorage.setItem('answerly-user', JSON.stringify(data.user)) } catch {}
      try { localStorage.setItem('answerly-token', data.token) } catch {}
      toast({ title: 'Account created', description: 'Welcome! Redirecting to home.' })

      // Notify navbar to update
      window.dispatchEvent(new Event('user-updated'))

      setTimeout(() => router.push('/'), 400)
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message || 'Please try again', variant: 'destructive' })
      setMessage(err.message || "Error")
    } finally {
      setLoading(false)
    }
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
                <CardTitle className="text-2xl font-bold text-white text-center">Create account</CardTitle>
              </CardHeader>
              {/* Avatar upload centered at top */}
              <div className="flex justify-center mt-3.5">
                <label htmlFor="avatar" className="cursor-pointer">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white/80 dark:border-white/20">
                    <img src={avatarPreview || '/placeholder-user.jpg'} alt="avatar preview" className="h-full w-full object-cover" />
                  </div>
                  <input id="avatar" type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setAvatarFile(file)
                    setAvatarFilename(file.name)
                    setAvatarPreview(URL.createObjectURL(file))

                    const reader = new FileReader()
                    reader.onload = () => {
                      const result = reader.result as string
                      const base64 = result.split(',')[1]
                      setAvatarBase64(base64)
                    }
                    reader.readAsDataURL(file)
                  }} className="sr-only" />
                </label>
              </div>
              <CardContent className="relative pt-2">
                <form onSubmit={submit} className="space-y-4" autoComplete="off" noValidate>
                  {/* Hidden decoy inputs to prevent browser autofill from populating visible fields */}
                  <input type="text" name="username" autoComplete="username" className="hidden" />
                  <input type="email" name="email" autoComplete="email" className="hidden" />
                  <input type="password" name="new-password" autoComplete="new-password" className="hidden" />
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white/90">Username</Label>
                    <Input id="username" name="signup-username" autoComplete="name" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white placeholder:text-white/70" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <Input id="email" name="signup-email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white placeholder:text-white/70" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">Password</Label>
                    <Input id="password" name="signup-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white placeholder:text-white/70" required />
                  </div>
                  {/* Avatar upload is at the top-center; no extra input here */}

                  <Button type="submit" disabled={loading} className="w-full rounded-full text-white bg-gradient-to-r from-fuchsia-500/80 via-indigo-500/80 to-pink-500/80 hover:from-fuchsia-600/90 hover:via-indigo-600/90 hover:to-pink-600/90 backdrop-blur-md border border-white/30">
                    {loading ? <GradientLoader size={18} /> : "Create account"}
                  </Button>
                </form>

                {message && <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/60 dark:border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white/95 dark:bg-white/10 px-2 text-zinc-500 backdrop-blur-sm">or continue with</span>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => oauth("google")}
                      disabled={loading}
                      className="bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => oauth("github")}
                      disabled={loading}
                      className="bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </div>

                {/* Login link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-white">Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  )
}
