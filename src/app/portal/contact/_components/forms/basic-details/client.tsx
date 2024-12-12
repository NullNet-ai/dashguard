"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { api } from "~/trpc/react";
import { type IFormProps } from "../types";
import { ContactBasicDetailsSchema } from "~/server/zodSchema/contacts/basicDetails";
import { validatePhoneAndEmailExist } from "./actions/validateEmailsAndPhones";
import {
  updateContactEmails,
  updateContactPhones,
} from "./actions/updateContactPhoneAndEmails";

export default function BasicDetails({ params, defaultValues }: IFormProps) {
  const utils = api.useUtils();
  const toast = useToast();

  const updateContact = api.contact.updateBasicDetails.useMutation();

  const handleSave = async ({
    data,
    form,
  }: IHandleSubmit<z.infer<typeof ContactBasicDetailsSchema>>) => {
    try {
      const { emails, phones } = data;
      const contact_id = params.id!;

      // Validate Primary Phone and Email
      const primary_phone = phones.find((phone) => phone.is_primary);
      const primary_email = emails.find((email) => email.is_primary);
      const validation = await validatePhoneAndEmailExist({
        primary_phone: primary_phone!,
        primary_email: primary_email!,
        contact_id,
        phones,
        emails,
      });

      const { emails: existing_emails, phones: existing_phones } =
        validation ?? {};

      if (existing_emails?.length || existing_phones?.length) {
        existing_emails?.map((_, index) => {
          form?.setError(`emails.${index}.email`, {
            message: `Email already exists.`,
          });
        });
        existing_phones?.map((_, index) => {
          form?.setError(`phones.${index}.raw_phone_number`, {
            message: `Phone number already exists.`,
          });
        });
      } else {
        await Promise.all([
          updateContactPhones({
            phones,
            contact_id,
          }),
          await updateContactEmails({
            emails,
            contact_id,
          }),
        ]);
        const response = await updateContact.mutateAsync({
          ...data,
          id: contact_id,
        });
        await utils.contact.invalidate(); //What for?
        toast.success("Basic Details submit successfully");
        return response;
      }

      return false;
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="ContactsOne"
      formSchema={ContactBasicDetailsSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "phones",
          formType: "phone-input",
          name: "phones",
          label: "Phone Number",
          required: true,
          options: {
            phoneNumberType: "multiple",
          },
        },
        {
          id: "emails",
          formType: "email-input",
          name: "emails",
          label: "Emails",
          required: true,
          options: {
            phoneEmailType: "multiple",
          },
        },
        {
          id: "first_name",
          formType: "input",
          name: "first_name",
          label: "First Name",
          required: true,
        },
        {
          id: "middle_name",
          formType: "input",
          name: "middle_name",
          label: "Middle Name",
          required: false,
        },
        {
          id: "last_name",
          formType: "input",
          name: "last_name",
          label: "Last Name",
          required: true,
        },
        {
          id: "goes_by",
          formType: "input",
          name: "goes_by",
          label: "Goes By",
          required: false,
        },
      ]}
    />
  );
}
