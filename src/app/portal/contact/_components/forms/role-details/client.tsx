"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";
import { api } from "~/trpc/react";
import { ContactRoleDetailsSchema } from "~/server/zodSchema/contacts/roleDetails";

export default function RoleDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();

  const updateRoleDetails = api.contact.updateRoleDetails.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ContactRoleDetailsSchema>>) => {
    try {
      const res = await updateRoleDetails.mutateAsync({
        id: params.id,
        user_role_id: data.user_role_id,
      });
      if (res.status_code == 200) {
        toast.success("Role Details submit sucessfully");
      }
      return res;
    } catch (error) {
      toast.error("Failed to submit Role Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Role Details"
      handleSubmit={handleSave}
      formKey="ContactRoleDetails"
      formSchema={ContactRoleDetailsSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[
        {
          id: "user_role_id",
          formType: "select",
          name: "user_role_id",
          label: "Role",
          placeholder: "Select Role",
          required: true,
        },
      ]}
    />
  );
}
