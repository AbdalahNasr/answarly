"use client"

import type React from "react"



import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Mail, Lock, User } from "lucide-react"
import { useI18n } from "@/components/i18n"
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import GradientLoader from "@/components/gradient-loader"
import { ClientOnly } from "@/components/ui/client-only"
import Link from "next/link"
import ReactBitsGalaxy from "@/components/ui/react-bits-galaxy"

export default function LoginPage() {
  const { dict, lang } = useI18n()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setMessage("")
    try {
      const raw = localStorage.getItem('answerly-user')
      if (raw) {
        const parsed = JSON.parse(raw)
        setAvatarUrl(parsed.avatarUrl || null)
        setEmail(parsed.email || '')
      }
    } catch {}
  }, [lang])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error || data?.message || 'Login failed'
        toast({ title: 'Sign in failed', description: msg, variant: 'destructive' })
        setMessage(msg)
        return
      }
      try { localStorage.setItem('answerly-user', JSON.stringify(data.user)) } catch {}
      try { localStorage.setItem('answerly-token', data.token) } catch {}
      toast({ title: 'Signed in', description: 'Welcome back! Redirecting to home...' })
      
      // Notify navbar to update
      window.dispatchEvent(new Event('user-updated'))
      
      setTimeout(() => router.push('/'), 400)
    } catch (err: any) {
      toast({ title: 'Sign in failed', description: err.message || 'Please try again', variant: 'destructive' })
      setMessage(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const oauth = (provider: "google" | "github") => {
    setLoading(true)
    setMessage("")
    setTimeout(() => {
      localStorage.setItem("answerly-user", JSON.stringify({ username: provider.toUpperCase() }))
      setLoading(false)
      setMessage(dict.login.success)
    }, 800)
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
                <CardTitle className="text-2xl font-bold text-white">{dict.login.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <ClientOnly>
                  {avatarUrl && (
                    <div className="flex justify-center mb-4">
                      <img src={avatarUrl} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
                    </div>
                  )}
                </ClientOnly>
                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">
                      {dict.login.username}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={dict.login.usernamePh}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white placeholder:text-white/70"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">
                      {dict.login.password}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder={dict.login.passwordPh}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white placeholder:text-white/70"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-600/90 hover:to-purple-600/90 backdrop-blur-md border border-white/30" disabled={loading}>
                    {loading ? (
                      <GradientLoader size={16} />
                    ) : (
                      <>
                        <span>{dict.login.signIn}</span>
                      </>
                    )}
                  </Button>
                </form>

                {message && <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}
                
                {/* Signup link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/60 dark:border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white/95 dark:bg-white/10 px-2 text-zinc-500 backdrop-blur-sm">{dict.login.or}</span>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => oauth("google")}
                      disabled={loading}
                      className="bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    >
                      <Github className="mr-2 h-4 w-4" />
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
                <div className="mt-6 text-center">
                  <a href="/forgot" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                    {dict.login.forgot}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    )
  }
