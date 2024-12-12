"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/EnhancedFormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";
import { contactDetailsSchema } from "~/server/zodSchema/contact/contactDetails";

export default function ContactDetails({
  params,
  defaultValues,
  selectOptions,
  multiSelectOptions,
}: IFormProps) {
  const utils = api.useUtils();
  const toast = useToast();
  const updateContact = api.contact.updateContactDetails.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof contactDetailsSchema>>) => {
    try {
      await updateContact.mutateAsync({
        ...data,
        id: params.id,
      });
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
      formSchema={contactDetailsSchema}
      defaultValues={defaultValues}
      multiSelectOptions={multiSelectOptions}
      selectOptions={selectOptions}
      enableFormRegisterToParent={true}
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
      ]}
    />
  );
}
