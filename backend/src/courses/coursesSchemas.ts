import { z } from "zod";
import { requiredString } from "../lib/validation.js";

const INVALID_PAGE = "Nieprawidłowy numer strony";

export const searchCoursesQuerySchema = z.object({
  name: requiredString("Parametr name jest wymagany"),
  page: z.coerce
    .number({ error: INVALID_PAGE })
    .int({ error: INVALID_PAGE })
    .min(0, { error: INVALID_PAGE })
    .default(0),
});

export const courseIdParamsSchema = z.object({
  courseId: requiredString("Nieprawidłowe id przedmiotu"),
});
