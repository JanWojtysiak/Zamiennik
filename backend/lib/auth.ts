import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

function isPwrEmail(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return domain === "pwr.edu.pl" || domain.endsWith(".pwr.edu.pl");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
    },
  },

  // https://better-auth.com/docs/concepts/hooks

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const email = ctx.body?.email;
      if (typeof email !== "string" || !isPwrEmail(email)) {
        throw new APIError("BAD_REQUEST", {
          message: "Dozwolone są tylko adresy @pwr.edu.pl",
        });
      }
    }),
  },
  trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
});
