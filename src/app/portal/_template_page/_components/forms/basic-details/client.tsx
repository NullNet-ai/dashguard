"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { api } from "~/trpc/react";

const FormSchema = z.object({
  first_name: z.string(),
  description: z.string(),
});

export default function BasicDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="basicDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "first_name",
          formType: "input",
          name: "first_name",
          label: "First Name",
          required: false,
          placeholder: "First Name",
        },
        {
          id: "description",
          formType: "textarea",
          name: "description",
          label: "description",
          required: false,
          placeholder: "description",
        },
      ]}
    />
  );
}
