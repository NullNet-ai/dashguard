import { z } from "zod";
import { isPhoneValid } from "~/components/platform/FormBuilder/utils/phoneValidator";

export const PhoneSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string().optional(),
  raw_phone_number: z
    .string({ message: "Phone Number is required." })
    .min(1, { message: "Phone Number is required." })
    .min(10, { message: "Phone Number must be at least 10 characters." }),
  iso_code: z.string().default(""),
  country_code: z.string().default(""),
  is_primary: z.boolean(),
});

export const PhoneSchemaValidation = PhoneSchema.superRefine((phone, ctx) => {
  const { raw_phone_number, iso_code } = phone; // Extract raw_phone_number and iso_code
  const region = iso_code || "US"; // Default to 'US' if iso_code is empty

  // Validate the phone number
  const isValid = isPhoneValid(raw_phone_number, region);
  if (!isValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Phone Number is invalid.`,
      path: ["raw_phone_number"], // Point the error to raw_phone_number
    });
  }
});

// Define the schema for the phone array with both duplicate and "at least one primary" validation
export const PhoneArraySchema = z
  .array(PhoneSchemaValidation)
  .superRefine((phones, ctx) => {
    phones.reduce((acc: Record<string, boolean>, phone, index) => {
      const key = phone.raw_phone_number;

      // Check for duplicates
      if (acc[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate phone number found.`,
          path: [index, "raw_phone_number"],
        });
      } else {
        acc[key] = true;
      }

      return acc;
    }, {});

    // Check if there is at least one phone with is_primary: true
    const has_primary = phones.some((phone) => phone.is_primary === true);

    if (!has_primary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one phone number should be marked as primary.",
        path: [], // This is a general array-level validation
      });
    }
  });

export const EmailSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string().optional(),
  email: z
    .string({ message: "Email is required." })
    .min(1, { message: "Email is required." })
    .email({ message: "Email is invalid." })
    .transform((email) => email.toLowerCase()), // Transform email to lowercase
  is_primary: z.boolean(),
});

export const EmailArraySchema = z
  .array(EmailSchema)
  .superRefine((emails, ctx) => {
    emails.reduce((acc: Record<string, boolean>, user, index) => {
      const email = user.email;

      // If this email is already a duplicate, add an issue
      if (acc[email]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate email found.`,
          path: [index, "email"],
        });
      } else {
        // Mark the email as seen in the accumulator
        acc[email] = true;
      }

      return acc;
    }, {});

    // Check if there is at least one phone with is_primary: true
    const has_primary = emails.some((email) => email.is_primary === true);

    if (!has_primary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one email should be marked as primary.",
        path: [], // This is a general array-level validation
      });
    }
  });

export const BasicDetailsForm = z.object({
  first_name: z
    .string({ message: "First Name is required." })
    .min(1, { message: "First Name is required." }),
  last_name: z
    .string({ message: "Last Name is required." })
    .min(1, { message: "Last Name is required." }),
  middle_name: z.string().nullable().default("").optional(),
  goes_by: z.string().nullable().default("").optional(),
});

export const ContactBasicDetailsSchema = BasicDetailsForm.extend({
  emails: EmailArraySchema,
  phones: PhoneArraySchema,
});
