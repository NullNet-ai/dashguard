import { z } from "zod";

export const ReportFiltersFormSchema = z.object({
  // id: z.string().optional(),
  // field: z.string().min(1, { message: "Field is required." }),
  // operator: z.string().min(1, { message: "Operator is required." }),
  // condition: z.string().optional(),
  // values: z.string().min(1, { message: "Values is required." }),
  // report_id: z.string(),
  filters: z.array(
    z.object({
      id: z.string().optional(),
      type: z.string().min(1, { message: "Type is required." }),
      field: z.string().min(1, { message: "Field is required." }),
      operator: z.string().min(1, { message: "Operator is required." }),
      // condition: z.string().optional(),
      values: z.string().min(1, { message: "Values is required." }),
      report_id: z.string().min(1),
    }),
  ),
});
