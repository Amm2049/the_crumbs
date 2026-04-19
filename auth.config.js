/**
 * auth.config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Edge-safe Auth.js configuration.
 * This file contains ONLY the parts that are safe to run in the Edge Runtime
 * (Next.js middleware / proxy). It does NOT import Prisma or bcrypt.
 *
 * Used by: proxy.js (middleware) for route protection decisions.
 */

export const authConfig = {
  providers: [], // Providers are registered in lib/auth.js (Node.js only)
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
