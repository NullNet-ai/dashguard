"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  position_role: z
    .string({ message: "Position Role is required." }) //nullable
    .min(1, { message: "Position Role is required." }),
});

export default function PositionRoleDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updatePositionRole = api.positionRole.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updatePositionRole.mutateAsync({
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
        formLabel="Basic Details"
        handleSubmit={handleSave}
        formKey="PositionRoleDetails"
        formSchema={FormSchema}
        defaultValues={defaultValues}
        fields={[
          {
            id: "position_role",
            formType: "input",
            name: "position_role",
            label: "Position Role",
            required: true,
            placeholder: "Position Role",
          },
        ]}
      />
    </>
  );
}
