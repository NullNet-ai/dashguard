import { z } from "zod";

export const EmployeeDetailsSchema = z.object({
  // organizations: z
  //   .array(z.object({ value: z.string(), label: z.string() }))
  //   .min(1, { message: "Organization is required." }),
  organizations: z.string({ message: "Organization is required." }),
  sub_organizations: z.string().optional(),
  job_title: z.string().min(1, { message: "Job Title is required." }),
  // sub_organizations: z
  //   .array(z.object({ value: z.string(), label: z.string() }))
  //   .optional(),
  // department_id: z.string({ message: "Department is required." }),
});

export type TEmployeeDetailsSchema = z.infer<typeof EmployeeDetailsSchema> & {
  contact_id: string;
};
