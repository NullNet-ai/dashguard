import { array, z } from "zod";

export const LogisticsSchema = z.object({
  company_id: z
    .string({ message: "Organization ID is required." })
    .min(1, { message: "Organization ID is required." }),
  department_id: z
    .string({
      message: "Department ID is required.",
    })
    .min(1, {
      message: "Department ID is required.",
    }),
  team_id: z.string().optional().nullable(),
  report_to: array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ).nonempty({ message: "Report To is required." }),
});
