"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { api } from "~/trpc/react";
import { type IFormProps } from "../types";

const FormSchema = z.object({
  tags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export default function ConfirmationDetails({
  params,
  defaultValues,
}: IFormProps) {
  // const updateContact = api.contact.updateContactWithTags.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      // const tags = data?.tags?.map((tag) => tag.value);
      // await updateContact.mutateAsync({
      //   id: params.id,
      //   ...data,
      //   tags,
      // });
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
      handleSubmit={handleSave}
      formLabel="Tags"
      formKey="Tags"
      fields={[
        {
          id: "tags",
          formType: "multi-select",
          name: "tags",
          label: "Tags",
        },
      ]}
    />
  );
}
