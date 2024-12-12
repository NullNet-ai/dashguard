import { z } from "zod";

export const participantsSchema = z.object({
  participants: z
    .array(
      z.object({
        full_name: z.string().optional(),
        assignment: z.string().optional(),
      }),
    )
    .optional()
    .superRefine((participants, ctx) => {
      if (!participants) return true;
      participants.reduce((uniqueNames, name, index) => {
        const full_name = name.full_name;
        if (full_name && uniqueNames.has(full_name)) {
          ctx.addIssue({
            path: [index, "full_name"],
            code: z.ZodIssueCode.custom,
            message: "Duplicate Full Name found",
          });
        } else if (full_name) {
          uniqueNames.add(full_name);
        }
        return uniqueNames;
      }, new Set());
    }),
});
