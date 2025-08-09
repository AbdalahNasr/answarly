"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Mail, Lock, User } from "lucide-react"
import { useI18n } from "@/components/i18n"
import GradientLoader from "@/components/gradient-loader"

export default function LoginPage() {
  const { dict, lang } = useI18n()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setMessage("")
  }, [lang])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    // Simulate sign-in delay
    setTimeout(() => {
      localStorage.setItem("answerly-user", JSON.stringify({ username }))
      setLoading(false)
      setMessage(dict.login.success)
    }, 800)
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
    <main>
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="mx-auto max-w-md">
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{dict.login.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-zinc-700 dark:text-zinc-300">
                      {dict.login.username}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={dict.login.usernamePh}
                        className="pl-9 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">
                      {dict.login.password}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={dict.login.passwordPh}
                        className="pl-9 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                  >
                    {loading ? <GradientLoader size={18} /> : dict.login.signIn}
                  </Button>
                </form>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/60 dark:bg-white/10" />
                  <span className="text-xs text-zinc-500">{dict.login.or}</span>
                  <div className="h-px flex-1 bg-white/60 dark:bg-white/10" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                    onClick={() => oauth("google")}
                    disabled={loading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {dict.login.signInWith} Google
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                    onClick={() => oauth("github")}
                    disabled={loading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    {dict.login.signInWith} GitHub
                  </Button>
                </div>

                {message && <p className="mt-4 text-sm text-green-600 dark:text-green-400">{message}</p>}

                <div className="mt-6 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <button className="hover:underline">{dict.login.forgot}</button>
                  <button className="hover:underline">{dict.login.signup}</button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
