import { z } from 'zod';
import { checkUsernameExist } from '~/app/portal/organization_account/_components/forms/account_details/actions';

import { platformPasswordValidator } from '~/components/platform/FormBuilder/Utils/platformPasswordValidation';

// Wrap the full validation schema to allow "test" to bypass validation
const account_secret = z
  .string()
  .min(1, { message: 'Please enter your password.' })
  .superRefine((value, ctx) => {
    if (value === '************') {
      return;
    }
    platformPasswordValidator(value, ctx);
  });

export const AccountDetailSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string(),
  organization_id: z.string().optional(),
  role_id: z.string().min(1, { message: 'Role is required.' }),
  account_id: z.string().min(1, { message: 'Username is required.' }),
  account_secret,
}).superRefine(async (data, ctx) => {
  try {
    // Call the tRPC validation endpoint
    const response = await checkUsernameExist({
      username: data.account_id as string,
      id: data.id ?? '',
    });
    if (!response?.isValid) {
      ctx.addIssue({
        path: ['account_id'],
        message: 'Username is already exists.',
        code: 'custom',
      });
    }
  } catch (error) {
    ctx.addIssue({
      path: ['username'],
      message: 'Error checking username availability.',
      code: 'custom',
    });
  }
});;

export const ContactAccountDetailsSchema = z.object({
  accounts: z.array(AccountDetailSchema),
});
