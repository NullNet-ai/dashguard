import { z } from "zod";

export const AccountDetailSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string().optional(),
  organization_id: z.string().min(1, {
    message: "Organization is required",
  }),
  user_role_id: z.string().min(1, { message: "Role is required." }),
  account_id: z.string().min(1, { message: "Username is required." }),
  account_secret: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(64, { message: "Password cannot exceed 64 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&]/, {
      message:
        "Password must contain at least one special character (@, $, !, %, *, ?, &)",
    }),
});

export const ContactAccountDetailsSchema = z.object({
  accounts: z.array(AccountDetailSchema),
});
