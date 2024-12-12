"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { AccountInformationSchema } from "../../../../../../server/zodSchema/contacts/accountInformation";

export default function AccountInformation({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateAccountInfo =
    api.accountInformation.updateCredential.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof AccountInformationSchema>>) => {
    try {
      const contact_id = params.id!;

      const response = await updateAccountInfo.mutateAsync({
        ...data,
        contact_id,
      });

      toast.success("Account Information submit sucessfully");
      return response;
    } catch (error) {
      toast.error("Failed to submit Account Information");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Account Information"
      handleSubmit={handleSave}
      formKey="ContactsCredentialDetails"
      formSchema={AccountInformationSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[
        {
          id: "email",
          formType: "input",
          name: "email",
          label: "Email",
          readonly: true,
          required: true,
        },
        {
          id: "password",
          formType: "password",
          name: "password",
          label: "Password",
          // placeholder: "******", removed placeholder as it is not required request by sir luis
          required: true,
        },
      ]}
    />
  );
}
