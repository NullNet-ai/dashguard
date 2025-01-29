"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { api } from "~/trpc/react";
import { DeviceBasicDetailsSchema } from "~/server/zodSchema/device/deviceBasicDetails";
import CustomBasicDetails from "../_custom/CustomBasicDetails";

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();

  const updateBasicDetails = api.device.updateBasicDetails.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof DeviceBasicDetailsSchema>>) => {
    try {
      const res = await updateBasicDetails.mutateAsync({
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
    <FormBuilder
      customDesign={{
        formClassName: "grid-cols-1 lg:grid-cols-1",
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="device_basic_details"
      formSchema={DeviceBasicDetailsSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[]}
      customRender={(form, options) => {
        return (
          <CustomBasicDetails
            defaultValues={defaultValues}
            form={form}
            selectOptions={selectOptions}
            options={{
              ...options,
              appendFormKey: options?.appendButtonKey || "",
            }}
          />
        );
      }}
    />
  );
}
