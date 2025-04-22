import { z } from 'zod';
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

export const ContactAccountDetailSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string().optional(),
  // organization_id: z.string().optional(),
  role_id: z.string().min(1, { message: 'Role is required.' }),
  email: z.string().min(1, { message: 'Email is required.' }),
  // account_secret,
})

export const ContactAccountDetailsSchema = z.object({
  accounts: z.array(ContactAccountDetailSchema),
});
