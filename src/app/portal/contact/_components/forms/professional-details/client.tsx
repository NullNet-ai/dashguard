"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { api } from "~/trpc/react";
import { type IFormProps } from "../types";
import { ProfessionalDetailsForm } from "~/server/zodSchema/contacts/basicDetails";

export default function ProfessionalDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const utils = api.useUtils();
  const toast = useToast();

  const updateContact = api.contact.updateProfessionalDetails.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ProfessionalDetailsForm>>) => {
    try {
      const contact_id = params.id!;

      const response = await updateContact.mutateAsync({
        ...data,
        id: contact_id,
      });
      await utils.contact.invalidate();
      toast.success("Professional Details submit sucessfully");
      return response;
    } catch (error) {
      toast.error("Failed to submit Professional Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      formProps={params}
      formLabel="Professional Details"
      handleSubmit={handleSave}
      formKey="ContactsProfessionalDetails"
      formSchema={ProfessionalDetailsForm}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[
        {
          id: "current_title",
          formType: "input",
          name: "current_title",
          label: "Current Title",
          placeholder: "Position Title",
          required: false,
        },
        {
          id: "years_of_experience",
          formType: "number-input",
          name: "years_of_experience",
          label: "Years of Experience",
          placeholder: "Years of Experience",
          required: false,
        },
        {
          id: "current_company",
          formType: "input",
          name: "current_company",
          label: "Current Company",
          placeholder: "Company Title",
          required: false,
        },
        {
          id: "current_salary",
          formType: "number-input",
          type: "number",
          name: "current_salary",
          label: "Current Salary",
          placeholder: "Current Salary",
          required: false,
        },
        {
          id: "salary_currency",
          formType: "input",
          name: "salary_currency",
          label: "Salary Currency",
          placeholder: "USD",
          required: false,
        },
        {
          id: "notice_period",
          formType: "select",
          name: "notice_period",
          label: "Notice Period",
          placeholder: "Notice Period",
          required: false,
        },
      ]}
    />
  );
}
