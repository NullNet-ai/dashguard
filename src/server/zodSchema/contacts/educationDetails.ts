import { z } from "zod";

export const EducationDetailsSchema = z.object({
  educations: z
    .array(
      z.object({
        id: z.string().min(1),
        institution: z.string().min(1, {
          message: "Institution Name is required.",
        }),
        country_id: z.string().min(1, {
          message: "Country Name is required.",
        }),
        degree: z.string().min(1, {
          message: "Degree Title is required.",
        }),
        degree_level_id: z.string().min(1, {
          message: "Degree Level is required.",
        }),
        completed_on: z.string().min(1, {
          message: "Completion On is required.",
        }),
        note: z.string().nullable().default("").optional(),
      }),
    )
    .min(1, {
      message: "There should be at least one education details.",
    }),
});
