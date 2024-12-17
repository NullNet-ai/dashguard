"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/EnhancedFormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";
import { recordContactDetailsSchema } from "~/server/zodSchema/contact/recordContactDetails";

export default function RecordContactDetails({
  params,
  defaultValues,
  selectOptions,
  multiSelectOptions,
}: IFormProps) {
  const utils = api.useUtils();
  const toast = useToast();
  const updateContactDetails = api.contact.updateContactDetails.useMutation();
  const updatePhoneEmail = api.contact.saveContactPhoneEmail.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof recordContactDetailsSchema>>) => {
    try {
      const { phone, email } = data || {};
      const contact_id = params.id;

      await Promise.all([
        updatePhoneEmail.mutateAsync({
          phone: phone?.map((item) => ({ ...item, contact_id })),
          email: email?.map((item) => ({ ...item, contact_id })),
          id: contact_id,
        }),
        updateContactDetails.mutateAsync({
          ...data,
          id: contact_id,
        }),
      ]);

      await utils.contact.invalidate();

      toast.success("Contact Details submit successfully");
    } catch (error) {
      toast.error("Failed to submit Contact Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      formProps={params}
      formLabel="Contact Details"
      handleSubmit={handleSave}
      formKey="contact_details"
      formSchema={recordContactDetailsSchema}
      defaultValues={defaultValues}
      multiSelectOptions={multiSelectOptions}
      selectOptions={selectOptions}
      enableFormRegisterToParent={true}
      fields={[
        {
          id: "phone",
          formType: "phone-input",
          placeholder: "Phone Number",
          name: "phone",
          label: "Phone Number",
          required: true,
        },
        {
          id: "email",
          formType: "email-input",
          placeholder: "email address",
          name: "email",
          label: "Email Address",
          required: true,
        },
        {
          id: "first_name",
          formType: "input",
          name: "first_name",
          label: "First Name",
          placeholder: "First Name",
          required: true,
        },
        {
          id: "last_name",
          formType: "input",
          name: "last_name",
          label: "Last Name",
          placeholder: "Last Name",
          required: true,
        },
        {
          id: "middle_name",
          formType: "input",
          name: "middle_name",
          label: "Middle Name",
          placeholder: "Middle Name",
          required: false,
        },
        {
          id: "date_of_birth",
          formType: "smart-date",
          name: "date_of_birth",
          label: "Date of Birth",
          placeholder: "MM/DD/YYYY",
          dateTimePickerProps: {
            maxDate: new Date(),
          },
        },
        {
          id: "address",
          formType: "address-input",
          name: "Address",
          placeholder: "Address",
          label: "Address",
        },
      ]}
    />
  );
}
