"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { CompensationsSchema } from "~/server/zodSchema/positions/compensations";
import { IFormProps } from "../types";

export default function Compensations({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateOrg = api.organization.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof CompensationsSchema>>) => {
    try {
      const res = await updateOrg.mutateAsync({
        id: params.id,
        ...data,
      });
      if (res.status_code == 200) {
        toast.success("Basic Details submit sucessfully");
      }
      return res;
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Organization"
      handleSubmit={handleSave}
      formKey="OrganizationOne"
      formSchema={CompensationsSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[
        {
          id: "parent_organization_id",
          formType: "select",
          name: "parent_organization_id",
          label: "Parent Organization",
          required: true,
        },
        {
          id: "name",
          formType: "input",
          name: "name",
          label: "Name",
          required: true,
        },
      ]}
    />
  );
}
