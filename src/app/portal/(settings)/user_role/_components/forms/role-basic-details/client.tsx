"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";

const FormSchema = z.object({
  role: z
    .string({ message: "Role is required" })
    .min(1, { message: "Role is required" }),
});

export default function RoleBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateRole = api.user_role.update.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateRole.mutateAsync({
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
        formKey="UserRolesBasicDetails"
        formSchema={FormSchema}
        defaultValues={defaultValues}
        fields={[
          {
            id: "role",
            formType: "input",
            name: "role",
            label: "Role",
            required: true,
            placeholder: "Role",
          },
        ]}
      />
    </>
  );
}
