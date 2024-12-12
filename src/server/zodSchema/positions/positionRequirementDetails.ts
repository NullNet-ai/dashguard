import { z } from "zod";

export const positionReqDetailsSchema = z.object({
  requirements: z
    .array(
      z.object({
        requirement_type: z.string().optional(),
        requirement_description: z.string().optional(),
      }),
    )
    .optional()
    .superRefine((requirements, ctx) => {
      if (!requirements) return true;
      requirements.reduce((uniqueReqType, requirement, index) => {
        const requirement_type = requirement.requirement_type;
        if (requirement_type && uniqueReqType.has(requirement_type)) {
          ctx.addIssue({
            path: [index, "requirement_type"],
            code: z.ZodIssueCode.custom,
            message: "Duplicate Requirement Type found",
          });
        } else if (requirement_type) {
          uniqueReqType.add(requirement_type);
        }
        return uniqueReqType;
      }, new Set());
    }),
});
