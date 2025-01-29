"use client";

import React, { useState } from "react";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { z } from "zod";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types/global/interfaces";
import { IFormProps } from "../types";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const FormSchema = z.object({
  is_monitoring_enabled: z.boolean().optional(),
  is_remote_access_enabled: z.boolean().optional(),
});
const SettingDetails = ({ params, defaultValues }: IFormProps) => {
  const updateSetting = api.device.updateDeviceSetting.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateSetting.mutateAsync({
        id: params.id,
        ...data,
      });
      if (res.status_code == 200) {
        toast.success("Instance name submitted sucessfully");
      }
      return res;
    } catch (error) {
      throw error;
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Setting"
      handleSubmit={handleSave}
      formKey="setting_details"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "is_monitoring_enabled",
          formType: "switch",
          name: "is_monitoring_enabled",
          label: "Enable Monitoring",
          placeholder: "Enable Monitoring",
        },
        {
          id: "is_remote_access_enabled",
          formType: "switch",
          name: "is_remote_access_enabled",
          label: "Enable Remote Access",
          placeholder: "Enable Remote Access",
        },
      ]}
    />
  );
};

export default SettingDetails;
