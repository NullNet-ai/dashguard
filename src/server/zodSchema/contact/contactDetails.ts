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
  address_id: z.string().nullable().optional(),
  details: z
    .object({
      address: z.string().optional(),
      address_line_one: z.string().optional(),
      address_line_two: z.string().optional(),
      latitude: z.number().optional(),
      // .refine((lat) => lat === undefined || (lat >= -90 && lat <= 90), {
      //   message: "Latitude must be between -90 and 90.",
      // })
      longitude: z.number().optional(),
      // .refine((lng) => lng === undefined || (lng >= -180 && lng <= 180), {
      //   message: "Longitude must be between -180 and 180.",
      // })
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
    .optional(),
});
