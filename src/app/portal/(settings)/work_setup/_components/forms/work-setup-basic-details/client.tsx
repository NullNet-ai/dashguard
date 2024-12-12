"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  work_setup: z
    .string({ message: "Work Setup is required" })
    .min(1, { message: "Work Setup is required" }),
});

export default function WorkSetupBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateWSetup = api.workSetups.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateWSetup.mutateAsync({
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
      formKey="WorkSetup"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "work_setup",
          formType: "input",
          name: "work_setup",
          label: "Work Setup",
          required: true,
          placeholder: "Work Setup",
        },
      ]}
    />
  );
}
