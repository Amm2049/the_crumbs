// only for node.js environment
//use for login page
//receive email and password from login, call db for check

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'
import { authConfig } from '@/lib/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Spread the Edge-safe config (callbacks, pages, session)
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null
        // Guard: Google-only users have no password
        if (!user.password) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Auto-create a DB user on first Google login
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Use profile (raw Google OIDC payload) for reliable data
          const email = profile?.email ?? user.email
          const name = profile?.name ?? user.name ?? email.split('@')[0]
          const image = profile?.picture ?? user.image ?? null

          await db.user.upsert({
            where: { email },
            update: {},
            create: {
              name,
              email,
              image,
              // password intentionally null — Google users don't use credentials
            },
          })
          return true
        } catch (error) {
          // Log the real error to the server console for debugging
          console.error('[Google signIn] Failed to upsert user:', error)
          return false
        }
      }
      return true // Credentials login — always proceed
    },
    // Extend jwt callback to load id and role from DB for Google users
    async jwt({ token, user, account, trigger, session }) {
      // `user` is only populated on the very first sign-in for any provider
      if (user) {
        if (account?.provider === 'google') {
          // Google: load DB record to get the real id and role
          const dbUser = await db.user.findUnique({ where: { email: token.email } })
          if (dbUser) {
            token.id    = dbUser.id
            token.role  = dbUser.role
            token.image = dbUser.image
          }
        } else {
          // Credentials: authorize() already returned id, role, image
          token.id    = user.id
          token.role  = user.role
          token.image = user.image
        }
      }
      // Handle profile updates (name/image) for ALL providers
      // ⚠️ Never propagate role from client-supplied session data
      if (trigger === 'update') {
        if (session?.image)       token.image = session.image
        if (session?.user?.image) token.image = session.user.image
        if (session?.name)        token.name  = session.name
        if (session?.user?.name)  token.name  = session.user.name
      }
      return token
    },
  },
})

