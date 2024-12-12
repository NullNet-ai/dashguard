"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { contactPersonalDetailsZod } from "~/server/zodSchema/contacts/contactPersonalDetailsZod";
import { useRef } from "react";
import { IFormProps } from "../types";

export default function PersonalDetails({
  params,
  defaultValues,
  selectOptions,
  multiSelectOptions,
}: IFormProps) {
  const utils = api.useUtils();
  const toast = useToast();
  const updateContact = api.contact.updatepersonaldetails.useMutation();
  const todayRef = useRef(new Date()); // Get today's date
  const yesterdayRef = useRef(new Date(todayRef.current)); // Create a copy of today's date
  yesterdayRef.current.setDate(todayRef.current.getDate() - 1); // Subtract 1 day

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof contactPersonalDetailsZod>>) => {
    try {
      await updateContact.mutateAsync({
        ...data,
        id: params.id,
      });
      await utils.contact.invalidate();

      toast.success("Personal Details submit successfully");
    } catch (error) {
      toast.error("Failed to submit Personal Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      formProps={params}
      formLabel="Personal Details"
      handleSubmit={handleSave}
      formKey="ContactsThree"
      formSchema={contactPersonalDetailsZod}
      defaultValues={defaultValues}
      multiSelectOptions={multiSelectOptions}
      selectOptions={selectOptions}
      fields={[
        {
          id: "date_of_birth",
          formType: "date",
          name: "date_of_birth",
          label: "Date of Birth",
          dateMaxDate: yesterdayRef.current,
        },
        {
          id: "nationalities",
          formType: "multi-select",
          name: "nationalities",
          label: "Nationality",
        },
        {
          id: "address.country",
          formType: "select",
          name: "address.country",
          label: "Country",
        },
        {
          id: "address.city",
          formType: "select",
          name: "address.city",
          label: "City",
        },
      ]}
    />
  );
}
