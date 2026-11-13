import { z } from "zod";

export const requiredString = (message: string) =>
  z.string({ error: message }).trim().min(1, { error: message });

export function firstIssueMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Nieprawidłowe dane";
}
