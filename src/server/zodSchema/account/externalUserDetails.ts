import { z } from 'zod';
import { checkUsernameExist } from '~/app/portal/organization_account/_components/forms/account_details/actions';

export const EmailSchema = z.object({
  id: z.string().optional(),
  email: z
    .string({ message: 'Email is required.' })
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Email is invalid.' })
    .transform((email) => email.toLowerCase()), // Transform email to lowercase
  is_primary: z.boolean().optional().default(true),
});

export const ExternalUserDetailsSchema = z
  .object({
    id: z.string().optional(),
    role: z
      .string({
        message: 'Role is required',
      })
      .min(1, {
        message: 'Role is required',
      }),
    email: z.array(EmailSchema),
  })
  .superRefine(async (data, ctx) => {
    try {
      // Call the tRPC validation endpoint
      const response = await checkUsernameExist({
        username: data.email?.[0]?.email as string,
        id: data.id ?? '',
      });
      if (!response?.isValid) {
        ctx.addIssue({
          path: ['email'],
          message: response?.record?.categories?.includes('Internal User')
            ? 'This email is already assigned to an internal user. You cannot invite an internal user as an external user.'
            : 'This email is already associated with an external user.',
          code: 'custom',
        });
      }
    } catch {
      ctx.addIssue({
        path: ['username'],
        message: 'Error checking username availability.',
        code: 'custom',
      });
    }
  });
