import { z } from 'zod';

export const ExternalUserDetailsSchema = z.object({
  role: z.string().min(1, {
    message: 'Role is required',
  }),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Email is invalid.' })
    .transform((email) => email.toLowerCase()),
});
