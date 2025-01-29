"use client";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import CustomSetupDetails from "../_custom/SetupDetails";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { z } from "zod";

export default function SetupDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const createOrgAccount = api.device.createOrganizationAccount.useMutation();
  const [orgAccount, setOrgAccount] = useState<Record<string, string> | null>();

  const handleCreateOrgAccount = async () => {
    try {
      const res = (await createOrgAccount.mutateAsync({
        id: params.id,
      })) as Record<string, string> | null;

      if (!!res && Object.keys(res).length) {
        toast.success(`${res?.message}`);
      }

      setOrgAccount(res);
      return res;
    } catch (error) {
      toast.error("Failed to create Organization Account");
    }
  };

  useEffect(() => {
    handleCreateOrgAccount();
  }, [params.id]);

  const handleSave = async ({}) => {
    try {
    } catch (error) {}
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "lg:grid-cols-1 grid-cols-1",
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Setup"
      handleSubmit={handleSave}
      formKey="setup_details"
      formSchema={z.object({})}
      defaultValues={defaultValues}
      fields={[]}
      customRender={(form) => (
        <CustomSetupDetails form={form} orgAccount={orgAccount} />
      )}
    />
  );
}
