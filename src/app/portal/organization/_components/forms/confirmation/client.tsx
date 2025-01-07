"use client";

import React from "react";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { z } from "zod";
import { api } from "~/trpc/react";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types/global/interfaces";
import { IFormProps } from "../types";

const FormSchema = z.object({
  tags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});
const Confirmation = ({ params, defaultValues }: IFormProps) => {
  const updateOrgWithTags =
    api.organization.updateOrganizationsWithTags.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const tags = data?.tags?.map((tag) => tag.value);
      await updateOrgWithTags.mutateAsync({
        id: params.id,
        ...data,
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
      handleSubmit={handleSave}
      formLabel="Confirmation"
      formKey="Confirmation"
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
};

export default Confirmation;
