import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { z } from "zod";
import { prisma } from "./prisma.js";

const pwrEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((email) => {
    const domain = email.split("@")[1] ?? "";
    return domain === "pwr.edu.pl" || domain.endsWith(".pwr.edu.pl");
  });
const SIGN_IN_WINDOW_SECONDS = 20 * 60;
const SIGN_IN_MAX_ATTEMPTS = 5;
const SIGN_IN_DELAY_MS = 1000;
const SIGN_IN_CAPTCHA_AFTER_FAILURES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:18473"; 
export const frontendOrigins = [
  frontendUrl,
  frontendUrl.replace("//localhost", "//127.0.0.1"),
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
    },
  },

  rateLimit: {
    enabled: true,
    storage: "memory",
    customRules: {
      "/sign-in/email": { window: SIGN_IN_WINDOW_SECONDS, max: SIGN_IN_MAX_ATTEMPTS },
    },
  },


  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        await sleep(SIGN_IN_DELAY_MS);
        // TODO: require a captcha 
        return;
      }

      if (ctx.path !== "/sign-up/email") return;
      if (!pwrEmailSchema.safeParse(ctx.body?.email).success) {
        throw new APIError("BAD_REQUEST", {
          message: "Dozwolone są tylko adresy @pwr.edu.pl",
        });
      }
    }),
  },
  trustedOrigins: frontendOrigins,
});
