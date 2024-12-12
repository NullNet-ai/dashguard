"use server";

import { type z } from "zod";
import {
  EmailArraySchema,
  PhoneArraySchema,
} from "~/server/zodSchema/contacts/basicDetails";
import { api } from "~/trpc/server";

export const updateContactPhones = async (values: {
  phones: z.infer<typeof PhoneArraySchema>;
  contact_id: string;
}) => {
  const { phones = [], contact_id } = values;
  const updated_ids: string[] = [];

  // Fetch existing phone numbers for the contact
  const existing_phones =
    await api.contactPhoneNumber.getPhoneNumbersByContactId({
      contact_id,
    });

  // Process each phone: update existing or create new
  for (const phone of phones) {
    const existing_phone = existing_phones.find(
      (existing) => existing.id === phone.id,
    );

    if (existing_phone) {
      updated_ids.push(existing_phone.id);
      await api.contactPhoneNumber.updatePhoneNumber({
        ...phone,
        id: existing_phone.id,
        status: "Active",
      });
    } else {
      const response = await api.contactPhoneNumber.createPhoneNumber({
        ...phone,
        contact_id,
        status: "Active",
      });
      if (response?.data?.id) {
        updated_ids.push(response.data.id);
      }
    }
  }

  // Archive or delete unused phone numbers
  for (const phone of existing_phones) {
    if (!updated_ids.includes(phone.id)) {
      // TODO: Decide between Hard Delete or Soft Delete
      await api.contactPhoneNumber.delete({
        id: phone.id,
      });
    }
  }

  return updated_ids;
};

export const updateContactEmails = async (values: {
  emails: z.infer<typeof EmailArraySchema>;
  contact_id: string;
}) => {
  const { emails = [], contact_id } = values;
  const updated_ids: string[] = [];
  const existing_emails = await api.contactEmail.getEmailsByContactId({
    contact_id: contact_id,
  });

  emails.map(async (email) => {
    const existing_email = existing_emails.find(
      (existing_email) => existing_email.id === email.id,
    );

    if (existing_email) {
      updated_ids.push(existing_email.id);
      await api.contactEmail.updateContactEmail({
        ...email,
        id: existing_email.id,
        status: "Active",
      });
    } else {
      const response = await api.contactEmail.createContactEmail({
        ...email,
        contact_id,
        status: "Active",
      });
      updated_ids.push(response?.data?.id);
    }
  });

  existing_emails.map(async (email) => {
    if (!updated_ids.includes(email.id)) {
      await api.contactEmail.delete({
        id: email.id,
      });
    }
  });

  return existing_emails;
};
