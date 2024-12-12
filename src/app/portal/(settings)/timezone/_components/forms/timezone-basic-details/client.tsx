"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  timezone: z
    .string({ message: "Timezone is required" })
    .min(1, { message: "Timezone is required" }),
});

export default function TimezoneBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateTimezone = api.timezones.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateTimezone.mutateAsync({
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
      formKey="timezone"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "timezone",
          formType: "input",
          name: "timezone",
          label: "Timezone",
          required: true,
          placeholder: "Timezone",
        },
      ]}
    />
  );
}
