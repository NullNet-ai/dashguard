"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  requirement_type: z
    .string({ message: "Requirement Type is required" })
    .min(1, { message: "Requirement Type is required" }),
});

export default function RequirementTypeBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateRequirementType = api.requirementType.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateRequirementType.mutateAsync({
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
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="RequirementType"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "requirement_type",
          formType: "input",
          name: "requirement_type",
          label: "Requirement Type",
          required: true,
          placeholder: "Requirement Type",
        },
      ]}
    />
  );
}
