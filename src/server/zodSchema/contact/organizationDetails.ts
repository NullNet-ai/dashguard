import { z } from "zod";

export const ContactOrganizationDetailsSchema = z.object({
  organizations: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .min(1, { message: "Organization is required." }),
  user_roles: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .min(1, { message: "Role is required." }),
});
