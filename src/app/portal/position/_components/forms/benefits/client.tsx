"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";
import { PositionBenefitsSchema } from "~/server/zodSchema/positions/positionBenefits";
import CustomBenefitsDetails from "../Custom/BenefitsDetails";

export default function Benefits({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const utils = api.useUtils();
  const toast = useToast();

  const updateBenefits = api.positionBenefit.saveBenefits.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof PositionBenefitsSchema>>) => {
    try {
      const position_id = params.id!;

      const response = await updateBenefits.mutateAsync({
        benefits: data?.benefits,
        position_id,
      });

      if (response) {
        toast.success("Benefit Details submit sucessfully");
        return response;
      }
      toast.error("Failed to submit Benefit Details.");
      await utils.contact.invalidate();
      return response;
    } catch (error) {
      toast.error("Failed to submit Benefit Details");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "w-full",
      }}
      myParent={params.shell_type}
      // enableFormRegisterToParent
      enableAppendForm={true}
      appendFormKey="benefit-form-button"
      formProps={params}
      formLabel="Benefits"
      handleSubmit={handleSave}
      formKey="PositionBenefits"
      formSchema={PositionBenefitsSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[]}
      customRender={(form, options) => (
        <CustomBenefitsDetails
          form={form}
          params={params}
          selectOptions={selectOptions}
          options={{
            ...options,
            appendFormKey: options?.appendButtonKey || "",
          }}
        />
      )}
    />
  );
}
