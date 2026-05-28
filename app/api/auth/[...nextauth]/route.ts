// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Email",
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
    async signIn({user , account , profile }) {
        if (account?.provider === "google") {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          })
          const data = await response.json();
          console.log("Google auth response:", data);
        (user as any).accessToken = data.access_token;
        (user as any).id = String(data.user.id);
        (user as any).email = data.user.email;
        (user as any).name = data.user.name;
        console.log("User after Google auth:", user);
          
        }
        return true
      },
    async jwt({ token, user }) {

      if (user) {
        token.userId = (user as any).id;
        token.email = (user as any).email;
        token.accessToken = (user as any).accessToken;
      }
      console.log("JWT callback - token:", token);
  
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.email = token.email as string
      }
      session.accessToken = token.accessToken as string;
      console.log("Session callback - session:", session);
      return session
    },
  },

  pages: {
    signIn: "/signin", 
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }