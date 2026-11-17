import type { NextFunction, Request, Response } from "express";
import { frontendOrigins } from "./auth.js";

export const CSRF_HEADER = "x-csrf-protection";

function refererOrigin(referer: string | undefined): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

// CSRF: every API request must come from our frontend, whatever its method. A missing Referer is rejected too,
// otherwise an attacker could bypass the check with <meta name="referrer" content="no-referrer">.
export function requireSameOriginReferer(req: Request, res: Response, next: NextFunction) {
  const origin = refererOrigin(req.headers.referer);
  if (!origin || !frontendOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}

// CSRF: an HTML form cannot set custom headers, and a cross-origin fetch with one needs a CORS
// preflight that only our frontend passes. So the header's mere presence proves the request is ours.
export function requireCsrfHeader(req: Request, res: Response, next: NextFunction) {
  if (req.headers[CSRF_HEADER] !== "1") {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
