import { z } from 'zod';

import { checkUsernameExist } from '~/app/portal/account_organization/_components/forms/account_details/actions';
import { isPhoneValid } from '~/components/platform/FormBuilder/Utils/phoneValidator';
import { platformPasswordValidator } from '~/components/platform/FormBuilder/Utils/platformPasswordValidation';

// Utility function to check for duplicates in an array
const checkForDuplicates = (
  array: any[],
  key: string,
  ctx: z.RefinementCtx,
) => {
  const seen = new Set();
  array.forEach((item, index) => {
    const value = item[key];
    if (seen.has(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate ${key.replaceAll('_', ' ')} found.`,
        path: [index, key],
      });
    } else {
      seen.add(value);
    }
  });
};

// Phone Number Schema
export const PhoneNumberSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string().optional(),
  raw_phone_number: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 characters.' }),
  iso_code: z.string().optional().default('US'), // Default to "US" for clarity
  country_code: z.string().optional().default(''),
  is_primary: z.boolean().optional().default(true),
});

// Enhanced Phone Schema with Validation
export const PhoneSchemaValidation = PhoneNumberSchema.superRefine(
  (phone, ctx) => {
    const { raw_phone_number, iso_code } = phone;
    const region = iso_code || 'US';

    if (!isPhoneValid(raw_phone_number, region)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Phone Number is invalid.`,
        path: ['raw_phone_number'],
      });
    }
  },
);

// Phone Array Schema
export const PhoneArraySchema = z
  .array(PhoneSchemaValidation)
  .superRefine((phones, ctx) => {
    checkForDuplicates(phones, 'raw_phone_number', ctx);

    if (!phones.some((phone) => phone.is_primary)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one phone number must be marked as primary.',
        path: [],
      });
    }
  });

// Email Schema
export const EmailSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string().optional(),
  email: z
    .string({ message: 'Email is required.' })
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Email is invalid.' })
    .transform((email) => email.toLowerCase()), // Transform email to lowercase
  is_primary: z.boolean().optional().default(true),
});

// Email Array Schema
export const EmailArraySchema = z
  .array(EmailSchema)
  .superRefine((emails, ctx) => {
    checkForDuplicates(emails, 'email', ctx);

    if (!emails.some((email) => email.is_primary)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one email must be marked as primary.',
        path: [],
      });
    }
  });

export const InternalUserDetailsSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  phones: PhoneArraySchema,
  emails: EmailArraySchema,
  first_name: z.string(),
  last_name: z.string(),
  middle_name: z.string().optional(),
});

export const account_secret = z
  .string()
  .min(1, { message: 'Password is required.' })
  .superRefine((value, ctx) => {
    if (value === '************') {
      return;
    }
    platformPasswordValidator(value, ctx);
  });

export const AccountDetailSchema = z
  .object({
    id: z.string().optional(),
    role_id: z.string().min(1, { message: 'Role is required.' }),
    email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email('Please enter a valid email.'),
  })
  .superRefine(async (data, ctx) => {
    try {
      // Call the tRPC validation endpoint
      const response = await checkUsernameExist({
        username: data.email as string,
        id: data.id as string,
      });
      if (!response?.isValid) {
        ctx.addIssue({
          path: ['email'],
          message:  'Email already exists.',
          code: 'custom',
        });
      }
    } catch {
      ctx.addIssue({
        path: ['email'],
        message: 'Error checking Email availability.',
        code: 'custom',
      });
    }
  });
