import { z } from "zod";

const isValidDate = (value: unknown): boolean => {
  if (typeof value === "string" && value) {
    const date = new Date(value);
    const is_valid = !isNaN(date.getTime());
    if (is_valid) {
      const today = new Date();
      // If date is greater than today, it's invalid
      if (date.getTime() > today.getTime()) {
        return false;
      }
    }
    return is_valid;
  }
  return false;
};

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
  date_of_birth: z
    .string()
    .nullable() // Allow null value
    .refine((value) => (value ? isValidDate(value) : true), {
      message: "Date of Birth must not be greater than today.",
    }),
});
