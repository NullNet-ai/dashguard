import { z } from "zod";

export const ContactCategoryDetailsSchema = z.object({
  categories: z.string().min(1, {
    message: "Category is required",
  }),
});
