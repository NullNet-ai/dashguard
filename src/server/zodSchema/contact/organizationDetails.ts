import { z } from "zod";

export const ContactOrganizationDetailsSchema = z.object({
  organizations: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
});
