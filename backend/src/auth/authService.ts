import type { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export async function getSession(headers: IncomingHttpHeaders) {
  return auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });
}

export async function getSessionUserId(headers: IncomingHttpHeaders) {
  const session = await getSession(headers);
  return session?.user.id ?? null;
}
