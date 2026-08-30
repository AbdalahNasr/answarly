"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect } from "react"

/**
 * Syncs NextAuth session data to localStorage so it works
 * with the existing custom auth system.
 */
function AuthSync() {
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const user = session.user as any
            const existing = localStorage.getItem("answerly-user")

            // Only sync if not already logged in via email/password
            if (!existing || existing === "{}") {
                const userData = {
                    id: user.id,
                    username: user.username || user.name || user.email?.split("@")[0],
                    email: user.email,
                    avatarUrl: user.avatarUrl || user.image,
                    role: user.role || "user",
                    provider: user.provider,
                }

                localStorage.setItem("answerly-user", JSON.stringify(userData))

                // Generate and store JWT token for social login users
                generateAndStoreToken()

                window.dispatchEvent(new Event("user-updated"))
            }
        } else if (status === "unauthenticated") {
            // Clear synced user when NextAuth session ends
            localStorage.removeItem("answerly-user")
            localStorage.removeItem("answerly-token")
            window.dispatchEvent(new Event("user-updated"))
        }
    }, [session, status])

    async function generateAndStoreToken() {
        try {
            const response = await fetch("/api/auth/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })

            if (response.ok) {
                const data = await response.json()
                localStorage.setItem("answerly-token", data.token)
            } else {
                console.error("Failed to generate token for social login")
            }
        } catch (error) {
            console.error("Error generating token:", error)
        }
    }

    return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthSync />
            {children}
        </SessionProvider>
    )
}
