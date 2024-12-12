import { z } from "zod";

export const contactDetailsSchema = z.object({
  id: z.string().min(1),
  first_name: z
    .string({
      message: "First Name is required.",
    })
    .min(1, {
      message: "First Name is required.",
    }),
  last_name: z
    .string({
      message: "Last Name is required.",
    })
    .min(1, {
      message: "Last Name is required.",
    }),
  middle_name: z.string().nullable(),
});
