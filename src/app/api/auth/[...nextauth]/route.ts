import NextAuth, { NextAuthOptions, Session, User } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Definiujemy własny interfejs rozszerzający Session
interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: Session; user: User }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      } as ExtendedSession;
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }