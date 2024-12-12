"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  employment_type: z
    .string()
    .min(1, { message: "Employment Type is required" })
    .nullable()
    .refine((val) => val !== null, { message: "Employment Type is required" }),
});

export default function EmploymentTypeDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateEmploymentType = api.employmentType.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateEmploymentType.mutateAsync({
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
      formKey="EmploymentTypeDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "employment_type",
          formType: "input",
          name: "employment_type",
          label: "Employment Type",
          required: true,
          placeholder: "Employment Type",
        },
      ]}
    />
  );
}
