import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter as NextAuthPrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/app/libs/prismadb";

// Custom Prisma Adapter to match your User schema
function PrismaAdapter() {
  const defaultAdapter = NextAuthPrismaAdapter(prisma);

  return {
    ...defaultAdapter,
    async createUser(data: any) {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          role: data.role ?? "user",
          isVerified: false, // use your schema field
        },
      });

      // Return in NextAuth expected format
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: null, // NextAuth expects this field even though we don't use it
        role: user.role,
        isVerified: user.isVerified,
      } as any;
    },

    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: null, // NextAuth expects this field
        role: user.role,
        isVerified: user.isVerified,
      } as any;
    },

    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: null, // NextAuth expects this field
        role: user.role,
        isVerified: user.isVerified,
      } as any;
    },
  };
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Invalid credentials");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword)
          throw new Error("Invalid credentials");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isValid) throw new Error("Invalid credentials");

        // Remove hashedPassword before returning user
        const { hashedPassword, ...safeUser } = user;
        return safeUser as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
