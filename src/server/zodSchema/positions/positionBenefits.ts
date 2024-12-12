import { z } from "zod";

export const PositionBenefitsSchema = z.object({
  benefits: z
    .array(
      z.object({
        id: z.string().min(1),
        benefit_id: z
          .string({ message: "Benefit is required." })
          .min(1, { message: "Benefit is required." }),
      }),
    )
    .superRefine((benefits, ctx) => {
      const seen = new Set();

      benefits.forEach((benefit, index) => {
        if (seen.has(benefit.benefit_id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate benefit found.`,
            path: [index, "benefit_id"], // Pointing to the specific duplicate field
          });
        } else {
          seen.add(benefit.benefit_id);
        }
      });
    }),
});

export type TPositionBenefits = z.infer<typeof PositionBenefitsSchema>;
