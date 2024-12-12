"use server";

import { type z } from "zod";
import { api } from "~/trpc/server";
import {
  EmailSchema,
  PhoneSchema,
} from "~/server/zodSchema/contacts/basicDetails";

export const validatePhoneAndEmailExist = async (values: {
  primary_phone: z.infer<typeof PhoneSchema>;
  primary_email: z.infer<typeof EmailSchema>;
  contact_id: string;
  phones: z.infer<typeof PhoneSchema>[];
  emails: z.infer<typeof EmailSchema>[];
}) => {
  const validator = await api.validator.validatePhoneAndEmail({
    primary_phone: values?.primary_phone!,
    primary_email: values?.primary_email!,
    contact_id: values.contact_id,
    phones: values.phones,
    emails: values.emails,
  });
  return validator?.data?.[0] as {
    emails: string[];
    phones: string[];
  };
};
