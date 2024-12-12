import { z } from "zod";

const today = new Date();

export const contactPersonalDetailsZod = z.object({
  id: z.string().min(1).optional(),
  date_of_birth: z
    .string()
    .nullable()
    .optional()
    .refine((date) => !date || new Date(date) <= today, {
      message: "Date of Birth should not be greater than today.",
    }),
  nationalities: z
    .array(
      z.object({
        value: z.string().min(2).max(20),
        label: z.string().min(2).max(20),
      }),
    )
    .optional(),
  address: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    postal_code: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }),
});
