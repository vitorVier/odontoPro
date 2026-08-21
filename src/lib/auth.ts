import NextAuth from "next-auth"
import prisma from './prisma'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  trustHost: true,
  providers: [Google],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.createdAt = user.createdAt
      }
      return session
    }
  }
})