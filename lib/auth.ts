import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "sqlite", // You can change this to postgres or other providers
    url: process.env.DATABASE_URL || "file:./better-auth.db",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  ],
});

export type Session = typeof auth.$Infer.Session;
