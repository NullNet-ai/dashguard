import { z } from 'zod'

import { platformPasswordValidator } from '~/components/platform/FormBuilder/Utils/platformPasswordValidation'

// Wrap the full validation schema to allow "test" to bypass validation
const account_secret = z.string().superRefine((value, ctx) => {
  if (value === '************') {
    return
  }
  platformPasswordValidator(value, ctx)
})

export const AccountDetailSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string(),
  organization_id: z.string().min(1, {
    message: 'Organization is required',
  }),
  role_id: z.string().min(1, { message: 'Role is required.' }),
  account_id: z.string().min(1, { message: 'Username is required.' }),
  account_secret,
})

export const ContactAccountDetailsSchema = z.object({
  accounts: z.array(AccountDetailSchema),
})
