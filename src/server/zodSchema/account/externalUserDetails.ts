import { z } from 'zod';

export const EmailSchema = z.object({
  id: z.string().optional(),
  email: z
    .string({ message: 'Email is required.' })
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Email is invalid.' })
    .transform((email) => email.toLowerCase()), // Transform email to lowercase
  is_primary: z.boolean().optional().default(true),
});

export const ExternalUserDetailsSchema = z.object({
  role: z.string().min(1, {
    message: 'Role is required',
  }),
  email: z.array(EmailSchema),
});
