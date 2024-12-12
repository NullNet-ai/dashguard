import { z } from "zod";

export const entityFormSchema = z.object({
  entity_name: z.string().min(1, {message: "Entity name is required."}),
  report_name: z.string().min(1, {message: "Report name is required."})
});
