import { z } from "zod";

export const columnFormSchema = z.object({
  columns: z.array(z.object({label: z.string(), value: z.string()}).optional())
})


