"use client";

import React from "react";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { z } from "zod";
import { api } from "~/trpc/react";
import { IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { IFormProps } from "../types";

const FormSchema = z.object({
  tags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});
const ConfirmationForm = ({ params, defaultValues }: IFormProps) => {
  const updatePositions = api.position.updatePositionsWithTags.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const tags = data?.tags?.map((tag) => tag.value);
      await updatePositions.mutateAsync({
        id: params.id,
        ...data,
        tags,
      });
    } catch (error) {
      throw error;
    }
  };
  return (
    <>
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
    </>
  );
};

export default ConfirmationForm;
