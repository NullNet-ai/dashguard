"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  degree_level: z
    .string({ message: "Degree Level is required" })
    .min(1, { message: "Degree Level is required" }),
});

export default function DegreeLevelBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateDegreeLevel = api.degreeLevel.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateDegreeLevel.mutateAsync({
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
    <>
      <FormBuilder
        myParent={params.shell_type}
        enableFormRegisterToParent
        formProps={params}
        formLabel="Degree Level Details"
        handleSubmit={handleSave}
        formKey="DegreeLevelBasicDetails"
        formSchema={FormSchema}
        defaultValues={defaultValues}
        fields={[
          {
            id: "degree_level",
            formType: "input",
            name: "degree_level",
            label: "Degree Level",
            required: true,
            placeholder: "Degree Level",
          },
        ]}
      />
    </>
  );
}
