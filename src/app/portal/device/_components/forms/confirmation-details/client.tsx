"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { api } from "~/trpc/react";

import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { type IFormProps } from "../types";

const FormSchema = z.object({
  tags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export default function ConfirmationDetails({
  params,
  defaultValues,
}: IFormProps) {
  const updateDevice = api.device.updateDeviceWithTags.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const tags = data?.tags?.map((tag) => tag.value);
      await updateDevice.mutateAsync({
        id: params.id,
        tags,
      });
    } catch (error) {
      throw error;
    }
  };
  return (
    <FormBuilder
      defaultValues={defaultValues}
      formSchema={FormSchema}
      myParent={params.shell_type}
      formProps={params}
      properties={{ isEditable: !defaultValues?.tags?.length }}
      handleSubmit={handleSave}
      formLabel="Tags"
      formKey="Tags"
      fields={[
        {
          id: "tags",
          formType: "multi-select",
          name: "tags",
          label: "Tags",
          multiSelectEnableCreate: true,
        },
      ]}
    />
  );
}
