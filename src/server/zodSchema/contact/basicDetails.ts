import { z } from "zod";

export const basicDetailsSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  middle_name: z.string().nullable(),
  id: z.string().min(1),
});
