import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { csrfHeaders } from "./csrf";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  fetchOptions: { headers: csrfHeaders },
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: true },
        lastName: { type: "string", required: true },
      },
    }),
  ],
});

export type User = typeof authClient.$Infer.Session.user;
