"use client";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { z } from "zod";
import { api } from "~/trpc/react";
import { LogisticsSchema } from "~/server/zodSchema/positions/logistics";
import { IFormProps } from "../types";
import CustomLogisticDetails from "../Custom/LogisticDetails";

export default function LogisticDetails({
  params,
  selectOptions,
  defaultValues,
}: IFormProps) {
  const updateLogistics = api.position.updateLogistics.useMutation();

  const toast = useToast();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof LogisticsSchema>>) => {
    try {
      const response = await updateLogistics.mutateAsync({
        id: params.id,
        ...data,
      });

      toast.success("Logistics submit sucessfully");

      return response;
    } catch (error) {
      toast.error("Failed to submit Logistics");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      defaultValues={defaultValues}
      formProps={params}
      formLabel="Logistics"
      handleSubmit={handleSave}
      formKey="logistics"
      formSchema={LogisticsSchema}
      selectOptions={selectOptions}
      fields={[]}
      customRender={(form) => (
        <CustomLogisticDetails form={form} selectOptions={selectOptions} />
      )}
    />
  );
}
