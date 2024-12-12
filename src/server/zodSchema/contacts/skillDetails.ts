import { z } from "zod";

export const SkillDetailsSchema = z.object({
  contact_id: z.string().optional(),
  skills: z.array(
    z.object({
      id: z.string().optional(),
      proficiency: z.string().optional(),
      years_of_experience: z
        .string({ message: "Years of Experience is required." })
        .min(1, { message: "Years of Experience is required." }),
      skill: z
        .string({ message: "Skill is required." })
        .min(1, { message: "Skill is required." }),
    }),
  ),
});
