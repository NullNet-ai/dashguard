import { z } from "zod";

export const ReportGroupingFormSchema = z.object({
  id: z.string().optional(),

});
