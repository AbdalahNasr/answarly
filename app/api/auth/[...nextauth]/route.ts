// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@/lib/db";
import User from "@/server/models/user.model";

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;

export const authOptions: AuthOptions = {
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
                }),
            ]
            : []),
        ...(process.env.GITHUB_CLIENT_ID
            ? [
                GitHubProvider({
                    clientId: process.env.GITHUB_CLIENT_ID,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
                }),
            ]
            : []),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/login",
    },
    // Fix "State cookie was missing" in development
    cookies: {
        pkceCodeVerifier: {
            name: "next-auth.pkce.code_verifier",
            options: {
                httpOnly: true,
                sameSite: "none" as const,
                path: "/",
                secure: useSecureCookies,
            },
        },
        state: {
            name: "next-auth.state",
            options: {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
                secure: useSecureCookies,
            },
        },
        callbackUrl: {
            name: "next-auth.callback-url",
            options: {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
                secure: useSecureCookies,
            },
        },
        csrfToken: {
            name: "next-auth.csrf-token",
            options: {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
                secure: useSecureCookies,
            },
        },
        sessionToken: {
            name: useSecureCookies ? "__Secure-next-auth.session-token" : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
                secure: useSecureCookies,
            },
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            if (!account || !user.email) return false;

            try {
                console.log("[social-auth] signIn input", {
                    provider: account.provider,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                });

                await connectToDatabase();
                const provider = account.provider as "google" | "github";
                const email = user.email.toLowerCase();

                let dbUser = await User.findOne({ email });

                if (!dbUser) {
                    dbUser = await User.create({
                        username: user.name || email.split("@")[0],
                        email,
                        avatarUrl: user.image || null,
                        provider,
                        providerId: account.providerAccountId,
                    });
                    console.log(`[social-auth] ✅ New ${provider} user created: ${email}`);
                } else {
                    if (!dbUser.provider || dbUser.provider === "credentials") {
                        dbUser.provider = provider;
                        dbUser.providerId = account.providerAccountId;
                    }
                    if (user.image && !dbUser.avatarUrl) {
                        dbUser.avatarUrl = user.image;
                    }
                    await dbUser.save();
                    console.log(`[social-auth] ✅ Existing user signed in via ${provider}: ${email}`);
                }

                return true;
            } catch (error: any) {
                console.error("[social-auth] ❌ Error:", error.message || error);
                return false;
            }
        },

        async jwt({ token, user, account }) {
            if (user && account) {
                try {
                    console.log("[social-auth] jwt input", {
                        hasUser: !!user,
                        provider: account.provider,
                        email: user.email,
                    });

                    await connectToDatabase();
                    const dbUser = await User.findOne({ email: user.email?.toLowerCase() });
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.username = dbUser.username;
                        token.role = dbUser.role;
                        token.avatarUrl = dbUser.avatarUrl;
                        token.provider = dbUser.provider;
                    }
                } catch (err) {
                    console.error("[social-auth] JWT callback error:", err);
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).username = token.username;
                (session.user as any).role = token.role;
                (session.user as any).avatarUrl = token.avatarUrl;
                (session.user as any).provider = token.provider;
            }

            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
