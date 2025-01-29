"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(1, { message: "Name is required" }),
  parent_organization_id: z
    .string({ message: "Parent Organization is required" })
    .min(1, { message: "Parent Organization is required" }),
});

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateOrg = api.organization.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
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
      formKey="organization_basic_details"
      formSchema={FormSchema}
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
