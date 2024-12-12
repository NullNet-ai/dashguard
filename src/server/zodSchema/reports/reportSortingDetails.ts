import { z } from "zod";

export const ReportSortingFormSchema = z.object({
  id: z.string().min(1),
  order_key: z.string().min(1, { message: "Order Key is required." }),
  order_direction: z
    .string()
    .min(1, { message: "Order Direction is required." }),
});
