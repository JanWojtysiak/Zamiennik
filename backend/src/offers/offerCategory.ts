import { z } from "zod";
import { OfferCategory } from "../../generated/enums.js";

export { OfferCategory };

export const offerCategorySchema = z.enum(OfferCategory, {
  error: "Nieprawidłowa kategoria",
});
