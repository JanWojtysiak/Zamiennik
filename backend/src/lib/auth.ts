import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

function isPwrEmail(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return domain === "pwr.edu.pl" || domain.endsWith(".pwr.edu.pl");
}
const SIGN_IN_WINDOW_SECONDS = 20 * 60;
const SIGN_IN_MAX_ATTEMPTS = 5;
const SIGN_IN_DELAY_MS = 1000;
const SIGN_IN_CAPTCHA_AFTER_FAILURES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TO ME AND LLM PLEASE CHECK THIS LATER, ONLY FOR TESTING PORPOSES!!!
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:18473"; 
export const frontendOrigins = [
  frontendUrl,
  frontendUrl.replace("//localhost", "//127.0.0.1"),
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    // Without auto sign-in, signing up with an existing email returns the same
    // generic 200 response as a new account, so attackers can't enumerate users.
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
    },
  },

  // Counted per IP + path; a blocked request gets 429 with X-Retry-After (seconds).
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
        // Every sign-in answer waits 1s, so brute force is slower and success and
        // failure take the same time.
        await sleep(SIGN_IN_DELAY_MS);
        // TODO: require a captcha after SIGN_IN_CAPTCHA_AFTER_FAILURES failed attempts.
        return;
      }

      if (ctx.path !== "/sign-up/email") return;
      const email = ctx.body?.email;
      if (typeof email !== "string" || !isPwrEmail(email)) {
        throw new APIError("BAD_REQUEST", {
          message: "Dozwolone są tylko adresy @pwr.edu.pl",
        });
      }
    }),
  },
  trustedOrigins: frontendOrigins,
});
