"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  reminder: z
    .string({ message: "Reminder is required" })
    .min(1, { message: "Reminder is required" }),
});

export default function ReminderBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateReminder = api.reminder.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateReminder.mutateAsync({
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
      formKey="reminder"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "reminder",
          formType: "input",
          name: "reminder",
          label: "Reminder",
          required: true,
          placeholder: "Reminder",
        },
      ]}
    />
  );
}
