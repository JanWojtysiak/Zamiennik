import { z } from "zod";
import { requiredString } from "../lib/validation.js";
import { offerCategorySchema } from "./offerCategory.js";

const ALL_FIELDS_REQUIRED = "Wszystkie pola są wymagane";

export const offerIdParamsSchema = z.object({
  id: requiredString("Nieprawidłowe id"),
});

export const offerCategoryQuerySchema = z.object({
  category: offerCategorySchema.optional(),
});

export const postOfferBodySchema = z
  .object(
    {
      offeredCourseId: requiredString(ALL_FIELDS_REQUIRED),
      wantedCourseId: requiredString(ALL_FIELDS_REQUIRED),
      offeredGroupId: requiredString(ALL_FIELDS_REQUIRED),
      wantedGroupId: requiredString(ALL_FIELDS_REQUIRED),
      category: offerCategorySchema.default("COURSE"),
    },
    { error: ALL_FIELDS_REQUIRED },
  )

.refine(
  (o) => o.category !== "COURSE" || o.offeredCourseId === o.wantedCourseId,
  {
    error: "Można wymienić się tylko na grupę tego samego przedmiotu",
    path: ["wantedCourseId"],
  },
)
.refine(
  (o) => o.offeredCourseId !== o.wantedCourseId || o.offeredGroupId !== o.wantedGroupId,
  {
    error: "Wybierz inną grupę niż oddawana",
    path: ["wantedGroupId"],
  },
);
