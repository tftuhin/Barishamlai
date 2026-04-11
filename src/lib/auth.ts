import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Extend the built-in JWT type with our custom fields
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    buildingId: string | null
    buildingName: string | null
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Developer super-admin: env-based credentials, no DB entry needed
        const devEmail = process.env.DEVELOPER_EMAIL?.trim()
        const devPass  = process.env.DEVELOPER_PASSWORD?.trim()
        if (
          devEmail && devPass &&
          credentials.email.trim().toLowerCase() === devEmail.toLowerCase() &&
          credentials.password.trim() === devPass
        ) {
          return {
            id: 'developer',
            name: 'Developer',
            email: devEmail,
            role: 'DEVELOPER',
            buildingId: null,
            buildingName: null,
          }
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { building: { select: { id: true, name: true } } },
        })
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          buildingId: user.buildingId ?? null,
          buildingName: user.building?.name ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user is the object returned from authorize() — cast via unknown is safe here
        const u = user as typeof user & {
          role: string
          buildingId: string | null
          buildingName: string | null
        }
        token.id          = u.id
        token.role        = u.role
        token.buildingId  = u.buildingId
        token.buildingName = u.buildingName
      }
      return token
    },
    async session({ session, token }) {
      session.user.id          = token.id
      session.user.role        = token.role
      session.user.buildingId  = token.buildingId
      session.user.buildingName = token.buildingName
      return session
    },
  },
}
