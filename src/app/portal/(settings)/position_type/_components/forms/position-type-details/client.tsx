"use client";

import { z } from "zod";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import React from "react";

const FormSchema = z.object({
  position_type: z
    .string({ message: "Position Type is required." }) // default value can be null/undefined
    .min(1, { message: "Position Type is required." }),
});

export default function PositionTypesBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updatePositionType =
    api.positionType.updatePositionTypeRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updatePositionType.mutateAsync({
        id: params.id,
        ...data,
      });
      if (res.status_code == 200) {
        toast.success("Position Type Basic Details submit sucessfully");
      }
      return res;
    } catch (error) {
      toast.error("Failed to submit Position Type Basic Details.");
    }
  };

  return (
    <>
      <FormBuilder
        myParent={params.shell_type}
        enableFormRegisterToParent
        formProps={params}
        formLabel="Basic Details"
        handleSubmit={handleSave}
        formKey="position-types-basic-details"
        formSchema={FormSchema}
        defaultValues={defaultValues}
        fields={[
          {
            id: "position_type",
            formType: "input",
            name: "position_type",
            label: "Position Type",
            required: true,
            placeholder: "Position Type",
          },
        ]}
      />
    </>
  );
}
