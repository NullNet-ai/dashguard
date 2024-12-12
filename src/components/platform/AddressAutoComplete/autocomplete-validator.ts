import { z } from "zod";

// ! DON'T FORGET CHANGE THE SCHEMA
// ! IF YOU CHANGE THE SCHEMA, YOU NEED TO UPDATE THE TEAM OR THE MANAGER
export const AddressSchema = z.object({
  searchedAddress: z.string().optional(),
  details: z
    .object({
      address_line_two: z.string().optional(),
      address: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      place_id: z.string(),
      street_number: z.string(),
      street: z.string(),
      region_code: z.string(),
      country_code: z.string(),
      address_line_one: z
        .string()
        .min(1, { message: "Address line one is required" }),
      city: z.string().min(1, { message: "City is required" }),
      state: z.string().min(1, { message: "State is required" }),
      region: z.string().min(1, { message: "Region is required" }),
      country: z.string().min(1, { message: "Country is required" }),
      postal_code: z.string().min(1, { message: "ZIP Code is required" }),
    })
    .optional(),
});
