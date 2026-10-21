import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Elysia } from "elysia";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "https://eddys.drimland.my.id",
  secret: process.env.BETTER_AUTH_SECRET || "eddy_english_ai_secret_key_change_me_in_prod",
  trustedOrigins: [
    "https://eddys.drimland.my.id",
    "http://eddys.drimland.my.id",
    "http://localhost:3005",
    "http://localhost:3000",
    "http://localhost:3003",
    "http://127.0.0.1:3005",
    "http://127.0.0.1:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
      : []),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
      },
      accessType: {
        type: "number",
        defaultValue: 2,
      },
      currentCefr: {
        type: "string",
        defaultValue: "A1",
      },
      avatarUrl: {
        type: "string",
        required: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const emailLower = user.email.toLowerCase();
          const isAdmin =
            emailLower.includes("khoirul") ||
            emailLower === "mrkhoriul@gmail.com" ||
            emailLower === "mrkhoirul@gmail.com";

          return {
            data: {
              ...user,
              role: isAdmin ? "admin" : "student",
              accessType: isAdmin ? 1 : 2,
              currentCefr: "A1",
            },
          };
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      accessType: "offline",
    },
  },
});

export const authPlugin = new Elysia({ name: "better-auth" })
  .all("/api/auth/*", ({ request }) => auth.handler(request))
  .macro({
    auth: {
      async resolve({ request }) {
        const session = await auth.api.getSession({ headers: request.headers });
        return { session: session?.session, user: session?.user };
      },
    },
  });
