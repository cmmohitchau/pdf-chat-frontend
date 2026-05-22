// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import Email from "next-auth/providers/email"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })

        if (!response.ok) return null

        const data = await response.json()
        if (!data.access_token) return null

        // Return user object — NextAuth stores this in the JWT
        return {
          id: String(data.user.id),
          email: data.user.email,
          name: data.user.name,
          accessToken: data.access_token,
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Google login
      if (account?.provider === "google" && profile) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: profile.email, name: profile.name }),
        })
        const data = await response.json()
        token.accessToken = data.access_token
        token.userId = profile.sub
      }

      // Credentials login — user object only exists on first sign-in
      if (account?.provider === "credentials" && user) {
        token.accessToken = (user as any).accessToken
        token.userId = user.id
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) session.user.id = token.userId as string
      session.accessToken = token.accessToken as string
      return session
    },
  },

  pages: {
    signIn: "/signin", // redirect here when unauthenticated
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }