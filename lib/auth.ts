import { db } from "@/lib/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "./supabase";

import * as schema from "./db/schema";
import { users } from "./db/schema";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          if (!data.user.email_confirmed_at) {
            throw new Error("Please verify your email before logging in.");
          }

          // Check if user exists in Drizzle DB
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.user.email!))
            .limit(1);

          if (!dbUser) {
            const [newUser] = await db
              .insert(users)
              .values({
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
                emailVerified: data.user.email_confirmed_at
                  ? new Date(data.user.email_confirmed_at)
                  : null,
              })
              .returning();

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
            };
          }

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
