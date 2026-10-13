import type { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { getSession } from "./authService.js";

// Handles all Better Auth endpoints: /api/auth/sign-up/email, /api/auth/sign-in/email, /api/auth/sign-out, ...
export const handleAuth = toNodeHandler(auth);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await getSession(req.headers);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.locals.session = session;
  next();
}
