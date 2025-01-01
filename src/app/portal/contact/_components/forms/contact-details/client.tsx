"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { contactDetailsSchema } from "~/server/zodSchema/contact/contactDetails";

export default function ContactDetails({
  params,
  defaultValues,
  selectOptions,
  multiSelectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateContact = api.contact.updateContactDetails.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof contactDetailsSchema>>) => {
    try {
      const response = await updateContact.mutateAsync({
        ...data,
        id: params.id,
      });
      if (response?.success) {
        const { data } = response;
        toast.success("Contact Details submit successfully");
        return data;
      }
      throw new Error("Failed to submit Contact Details");
    } catch (error) {
      toast.error("Failed to submit Contact Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Contact Details"
      handleSubmit={handleSave}
      formKey="contact_details"
      formSchema={contactDetailsSchema}
      defaultValues={defaultValues}
      multiSelectOptions={multiSelectOptions}
      selectOptions={selectOptions}
      fields={[
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
