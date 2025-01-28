import { z } from "zod";

  const fullPasswordValidation = z
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
  });

// Wrap the full validation schema to allow "test" to bypass validation
const account_secret = z.string().superRefine((value, ctx) => {
  if (value === "************") {
    // If the value is "test", bypass validation
    return;
  }

  // Validate the value against the full password validation schema
  const result = fullPasswordValidation.safeParse(value);

  if (!result.success) {
    // Add each specific issue to the context for detailed errors
    result.error.issues.forEach((issue) => {
      ctx.addIssue(issue);
    });
  }
});

export const AccountDetailSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string().optional(),
  organization_id: z.string().min(1, {
    message: "Organization is required",
  }),
  role_id: z.string().min(1, { message: "Role is required." }),
  account_id: z.string().min(1, { message: "Username is required." }),
  account_secret
});

export const ContactAccountDetailsSchema = z.object({
  accounts: z.array(AccountDetailSchema),
});
