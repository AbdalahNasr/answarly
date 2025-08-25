"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/components/i18n"
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import GradientLoader from "@/components/gradient-loader"

export default function SignupPage() {
  const { dict } = useI18n()
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

  useEffect(() => {
    // Force-clear any autofilled values that some browsers persistentely inject
    setEmail('')
    setUsername('')
    try {
      const emailEl = document.querySelector('input#email') as HTMLInputElement | null
      if (emailEl) {
        emailEl.value = ''
        emailEl.blur()
      }
      const userEl = document.querySelector('input#username') as HTMLInputElement | null
      if (userEl) {
        userEl.value = ''
        userEl.blur()
      }
    } catch {}
  }, [])

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
    <main className="min-h-screen flex items-center justify-center">
      <section className="w-full flex-1 flex items-center justify-center py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 py-0 w-full max-w-md md:max-w-lg">
          <div className="mx-auto">
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />

              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 text-center">Create account</CardTitle>
              </CardHeader>
              {/* Avatar upload centered at top */}
              <div className="flex justify-center mt-3.5">
                <label htmlFor="avatar" className="cursor-pointer">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white/80 dark:border-white/10">
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
                    <Label htmlFor="username" className="text-zinc-700 dark:text-zinc-300">Username</Label>
                    <Input id="username" name="signup-username" autoComplete="name" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email</Label>
                    <Input id="email" name="signup-email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
                    <Input id="password" name="signup-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl" required />
                  </div>
                  {/* Avatar upload is at the top-center; no extra input here */}

                  <Button type="submit" disabled={loading} className="w-full rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600">
                    {loading ? <GradientLoader size={18} /> : "Create account"}
                  </Button>
                </form>

                {message && <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
