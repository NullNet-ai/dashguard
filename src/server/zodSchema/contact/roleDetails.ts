import { z } from "zod";

export const ContactRoleDetailsSchema = z.object({
  user_role_id: z
    .string({
      message: "Role is required.",
    })
    .min(1, {
      message: "Role is required.",
    }),
});
