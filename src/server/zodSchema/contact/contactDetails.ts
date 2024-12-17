import { z } from "zod";

export const isValidDate = (value: unknown): boolean => {
  if (typeof value === "string" && value) {
    const date = new Date(value);
    const is_valid = !isNaN(date.getTime());
    return is_valid;
  }
  return false;
};

const isDateNotGreaterThanToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getTime() <= today.getTime();
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
      message: "Invalid Date.",
    })
    .refine((value) => (value ? isDateNotGreaterThanToday(value) : true), {
      message: "Date of Birth must not be greater than today.",
    }),
  address_id: z.string().nullable().optional(),
  details: z
    .object({
      address: z.string().optional(),
      address_line_one: z.string().optional(),
      address_line_two: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      place_id: z.string().optional(),
      street_number: z.string().optional(),
      street: z.string().optional(),
      region: z.string().optional(),
      region_code: z.string().optional(),
      country_code: z.string().optional(),
      // .refine((code) => !code || code.length <= 3, {
      //   message: "Country Code must be a maximum of 3 characters.",
      // })
      postal_code: z.string().optional(),
      // .refine((code) => !code || /^\d{4,10}$/.test(code), {
      //   message: "Postal Code must be between 4 and 10 digits.",
      // })
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
    })
    .superRefine((details, ctx) => {
      // Check if the object is empty; skip validation if true
      if (!Object.values(details || {}).length) {
        return;
      }

      // List of required fields and their display names
      const required_fields: Record<string, string> = {
        address_line_one: "Address Line 1",
        postal_code: "ZIP Code",
        country: "Country",
        // state: "State",
        city: "City",
      };

      // Validate required fields
      Object.entries(required_fields).forEach(([field, display_name]) => {
        //@ts-expect-error - details is an object
        if (!details[field]) {
          ctx.addIssue({
            path: [field],
            code: z.ZodIssueCode.custom,
            message: `${display_name} is required.`,
          });
        }
      });
    }),
});
