import { z } from "zod";

export const CompensationsSchema = z.object({
  pay_period_id: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  minimum_salary: z.number().nullable().optional(),
  maximum_salary: z.number().nullable().optional(),
});
