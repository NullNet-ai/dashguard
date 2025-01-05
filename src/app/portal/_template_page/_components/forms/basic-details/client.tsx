"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
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

  // @ts-expect-error - Fix type later
  const updateOrg = api[params.entity].updateName.useMutation();

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
