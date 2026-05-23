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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await db.user.upsert({
            where: { email: user.email },
            update: {}, // Already exists — do nothing
            create: {
              name: user.name,
              email: user.email,
              image: user.image,
              // password intentionally null — Google users don't use credentials
            },
          })
          return true
        } catch (error) {
          console.error('Failed to upsert Google user:', error)
          return false
        }
      }
      return true // Credentials login — always proceed
    },
    // Extend jwt callback to load id and role from DB for Google users
    async jwt({ token, user, account, trigger, session }) {
      // On first sign-in, fetch from DB to get id and role
      if (account?.provider === 'google') {
        const dbUser = await db.user.findUnique({ where: { email: token.email } })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.image = dbUser.image
        }
        return token
      }
      // Credentials login — existing jwt callback logic
      return authConfig.callbacks.jwt({ token, user, account, trigger, session })
    },
  },
})

