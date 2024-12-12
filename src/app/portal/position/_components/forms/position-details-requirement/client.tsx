"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";

import { positionReqDetailsSchema } from "~/server/zodSchema/positions/positionRequirementDetails";
import { IFormProps } from "../types";
import {
  createPositionRequirementDetails,
  IData,
} from "../Action/createUpdatePositionRequirementDetails";
import RequirementsDetails from "../Custom/RequirementsDetails";

export default function PositionDetailsRequirementsForm({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof positionReqDetailsSchema>>) => {
    try {
      await createPositionRequirementDetails({
        id: params?.id,
        ...data,
      } as IData);
    } catch (error) {
      toast.error("Failed to submit Position Details");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "w-full",
      }}
      myParent={params.shell_type}
      appendFormKey="req-details-form-button"
      enableAppendForm={true}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Requirements"
      handleSubmit={handleSave}
      formKey="requirements-details"
      formSchema={positionReqDetailsSchema}
      defaultValues={defaultValues}
      fields={[]}
      customRender={(form, options) => (
        <RequirementsDetails
          form={form}
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
