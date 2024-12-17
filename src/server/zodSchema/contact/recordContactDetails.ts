import { EmailArraySchema, PhoneArraySchema } from "./contactPhoneEmail";
import { contactDetailsSchema } from "./contactDetails";

export const recordContactDetailsSchema = contactDetailsSchema.extend({
  email: EmailArraySchema,
  phone: PhoneArraySchema,
});
