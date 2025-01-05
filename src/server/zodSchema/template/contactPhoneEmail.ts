import { z } from "zod";

// Email Schema
export const EmailSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string().optional(),
  email: z
    .string({ message: "Email is required." })
    .min(1, { message: "Email is required." })
    .email({ message: "Email is invalid." })
    .transform((email) => email.toLowerCase()), // Transform email to lowercase
  is_primary: z.boolean().optional().default(true),
});

export const EmailArraySchema = z
  .array(EmailSchema.merge(z.object({
    // <entity>_id: z.string().nullable().optional(),
  })))

export const ContactPhoneEmailSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  // <entity>_email: EmailArraySchema,
});
