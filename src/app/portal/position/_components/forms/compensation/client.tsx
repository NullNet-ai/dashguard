"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { api } from "~/trpc/react";

import { CompensationsSchema } from "~/server/zodSchema/positions/compensations";
import CustomCompensationDetails from "../Custom/CompensationDetails";
import { IDropdown } from "../types";

export interface CompensationDetails {
  params: Record<string, any>;
  defaultValues: Record<string, any>;
  selectOptions: {
    pay_period_options: IDropdown[];
    currency_options: IDropdown[];
  };
}

export default function CompensationDetils({
  params,
  defaultValues,
  selectOptions,
}: CompensationDetails) {
  const toast = useToast();

  const updateCompensation = api.position.updateCompensation.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof CompensationsSchema>>) => {
    try {
      const response = await updateCompensation.mutateAsync({
        ...data,
        id: params.id,
      });
      return response;
    } catch (error) {
      toast.error("Failed to submit Compensation.");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "w-full",
      }}
      myParent={params.shell_type}
      appendFormKey="test-form-button"
      formProps={params}
      formLabel="Compensation"
      handleSubmit={handleSave}
      formKey="position-compensation"
      formSchema={CompensationsSchema}
      defaultValues={defaultValues}
      fields={[]}
      customRender={(form, options) => (
        <CustomCompensationDetails
          form={form}
          selectOptions={selectOptions ?? {}}
          options={{
            ...options,
            appendFormKey: options?.appendButtonKey || "",
          }}
        />
      )}
    />
  );
}
