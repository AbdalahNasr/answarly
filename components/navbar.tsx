"use client"

import Link from "next/link"
import { useI18n } from "@/components/i18n"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import GlobalSearch from "@/components/global-search"
import LanguageToggle from "@/components/language-toggle"
import ThemeToggle from "@/components/theme-toggle"
import { LogOut, User, FileText, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { ClientOnly } from "@/components/ui/client-only"
import { signOut } from "next-auth/react"

export default function Navbar() {
  const { dict, lang } = useI18n()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    
    const loadUserData = () => {
      try {
        const raw = localStorage.getItem('answerly-user')

        if (raw) {
          const userData = JSON.parse(raw)
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (e) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
    
    // Reduce frequency to prevent constant re-renders
    const interval = setInterval(loadUserData, 5000) // Changed from 1000ms to 5000ms
    
    return () => clearInterval(interval)
  }, [mounted])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
    } catch (e) {
      // ignore, we'll still clear local state
    }
    localStorage.removeItem('answerly-user')
    localStorage.removeItem('answerly-token')
    setUser(null)
    window.dispatchEvent(new Event('user-updated'))
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' })
    router.push('/')
  }

  // Force refresh user data from localStorage
  const refreshUserData = () => {
    try {
      const raw = localStorage.getItem('answerly-user')
      const token = localStorage.getItem('answerly-token')
      
      console.log('Refreshing user data:', { raw, token })
      
      if (raw) {
        const userData = JSON.parse(raw)
        console.log('Parsed user data:', userData)
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (e) {
      console.error('Error refreshing user data:', e)
      setUser(null)
    }
  }

  // derive avatar src with cache-bust token when needed
  const getDisplayAvatar = () => {
    const url = user?.avatarUrl
    console.log('Navbar Avatar Debug:', { 
      user, 
      avatarUrl: url,
      hasUser: !!user,
      userId: user?.id || user?._id,
      username: user?.username,
      localStorage: {
        user: localStorage.getItem('answerly-user'),
        token: localStorage.getItem('answerly-token')
      }
    })
    
    if (!url) return null // Let Avatar component handle letters display
    
    // Only add cache busting if the URL doesn't already have a timestamp
    // This prevents constant flickering
    if (url.includes('t=') || url.includes('timestamp=')) return url
    
    // Add cache busting parameter with a stable timestamp based on user ID
    const separator = url.includes('?') ? '&' : '?'
    const timestamp = user?.id || user?._id || Date.now()
    return `${url}${separator}t=${timestamp}`
  }

  const token = mounted ? localStorage.getItem('answerly-token') : null
  const isLoggedIn = mounted && (user?.id || user?._id)

  const mainLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/topics", label: dict.nav.topics },
    { href: "/history", label: dict.nav.history },
    { href: "/leaderboard", label: dict.nav.leaderboard },
    { href: "/qa", label: dict.nav.qa },
    { href: "/quiz/setup", label: dict.nav.quiz },
  ]

  // Add My Questions link if user is logged in
  const userLinks = isLoggedIn ? [
    { href: "/my-questions", label: dict.nav.myQuestions }
  ] : []

  // Auth link (login/logout)
  const authLink = isLoggedIn 
    ? { href: "#", label: dict.nav.logout, onClick: handleLogout, isButton: true }
    : { href: "/login", label: dict.nav.login }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/40 dark:border-white/10 bg-gradient-to-b from-white/70 to-white/40 dark:from-[#0a0b1a]/70 dark:to-[#0a0b1a]/40 backdrop-blur supports-[backdrop-filter]:bg-transparent transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Left side - Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl text-white">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-pink-600" />
            <span className="relative text-xs font-bold">Q&A</span>
          </div>
          <span className="font-semibold tracking-tight">Answerly</span>
          <span className="sr-only">Answerly Home</span>
        </Link>

        {/* Center - Main navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch={true}
              className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <ClientOnly>
            {userLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch={true}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
              >
                {l.label}
              </Link>
            ))}
          </ClientOnly>
        </nav>

        {/* Right side - Search, Language, Theme, Auth */}
        <div className="flex items-center gap-4">
          <GlobalSearch />
          <LanguageToggle />
          <ThemeToggle />
          
          {/* Auth Link - Only show login link when not logged in */}
          <ClientOnly>
            {!isLoggedIn && (
              <Link
                href="/login"
                prefetch={true}
                className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {dict.nav.login}
              </Link>
            )}
          </ClientOnly>
          
          {/* Profile Avatar - Only show when logged in */}
          <ClientOnly>
            {isLoggedIn && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={getDisplayAvatar() || ''} 
                        alt={user.username || 'User'}
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(false)}
                      />
                      <AvatarFallback>
                        {user.username ? 
                          user.username.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() 
                          : 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id || user._id}`} prefetch={true}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-questions" prefetch={true}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{dict.nav.myQuestions}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={refreshUserData}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Refresh Data</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{dict.nav.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </ClientOnly>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          <GlobalSearch />
          <LanguageToggle />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl bg-white/80 dark:bg-white/5 border-white/60 dark:border-white/10"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {mainLinks.map((l) => (
                <DropdownMenuItem key={l.href} asChild>
                  <Link href={l.href}>{l.label}</Link>
                </DropdownMenuItem>
              ))}
              <ClientOnly>
                {userLinks.map((l) => (
                  <DropdownMenuItem key={l.href} asChild>
                    <Link href={l.href} className="text-indigo-600 dark:text-indigo-400">{l.label}</Link>
                  </DropdownMenuItem>
                ))}
              </ClientOnly>
              <ClientOnly>
                {authLink.isButton ? (
                  <DropdownMenuItem onClick={authLink.onClick} className="text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    {authLink.label}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href={authLink.href}>{authLink.label}</Link>
                  </DropdownMenuItem>
                )}
              </ClientOnly>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

