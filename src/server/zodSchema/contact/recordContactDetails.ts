import { EmailArraySchema, PhoneArraySchema } from "./contactPhoneEmail";
import { contactDetailsSchema } from "./contactDetails";

export const recordContactDetailsSchema = contactDetailsSchema.extend({
  emails: EmailArraySchema,
  phones: PhoneArraySchema,
});
