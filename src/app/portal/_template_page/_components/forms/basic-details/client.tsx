"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { api } from "~/trpc/react";

const FormSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(1, { message: "Name is required" }),
});

export default function BasicDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      // alert(JSON.stringify(data, null, 2));
      return update.mutateAsync({
        id: params.id,
        data,
        entity: params.entity!,
      });
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      // enableFormRegisterToParent // Default value is false can proceed next without required fields
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="basicDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "name",
          formType: "input",
          name: "name",
          label: "Name",
          required: true,
          placeholder: "Name",
        },
      ]}
    />
  );
}
