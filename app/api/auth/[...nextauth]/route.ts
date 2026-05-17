import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // First login
      if (account && profile) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google` , {
          method :'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: profile.email,
            name: profile.name
          })
        })

        const data = await response.json()
        token.accessToken = data.access_token
        token.userId = profile.sub
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
      }

      session.accessToken = token.accessToken as string

      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }