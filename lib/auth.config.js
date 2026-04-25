//edge safe auth config
//only include session,callback and pages

export const authConfig = {
  providers: [], 
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.image = user.image
      }
      if (trigger === 'update') {
        if (session?.image) token.image = session.image
        if (session?.user?.image) token.image = session.user.image
        if (session?.name) token.name = session.name
        if (session?.user?.name) token.name = session.user.name
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.image = token.image
      if (token.name) session.user.name = token.name
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
