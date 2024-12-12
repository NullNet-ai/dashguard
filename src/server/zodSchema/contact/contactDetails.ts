import { z } from "zod";

export const contactDetailsSchema = z.object({
  id: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  middle_name: z.string().nullable(),
});
