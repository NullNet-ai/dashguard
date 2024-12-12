"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { PositionBasicDetailsFormValidation } from "~/server/zodSchema/positions/basicDetails";
import { IFormProps } from "../types";

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updatePosition = api.position.updateBasicDetails.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof PositionBasicDetailsFormValidation>>) => {
    try {
      const res = await updatePosition.mutateAsync({
        id: params.id,
        ...data,
      });

      const { success, status_code } = res || {};

      if (status_code === 409) {
        return res; // Needs to return since this is handled by form submit
      }

      if (success) {
        toast.success("Basic Details submit sucessfully");
        return res;
      }

      toast.error("Failed to submit Basic Details");
      //TODO: Check ticket 180
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
        formKey="position-basic-details"
        formSchema={PositionBasicDetailsFormValidation}
        defaultValues={defaultValues}
        selectOptions={selectOptions}
        fields={[
          {
            id: "title",
            formType: "input",
            name: "title",
            label: "Title",
            placeholder: "Job Title",
            required: true,
          },
          // {
          //   id: "position_role_id",
          //   formType: "select",
          //   name: "position_role_id",
          //   label: "Role",
          //   placeholder: "Position Role",
          //   required: true,
          // },
          {
            id: "employment_type_id",
            formType: "select",
            name: "employment_type_id",
            label: "Employment Type",
            placeholder: "Employment Type",
            required: true,
          },
          {
            id: "position_type_id",
            formType: "select",
            name: "position_type_id",
            label: "Position Type",
            placeholder: "Position Type",
            required: true,
          },
          {
            id: "activation_date",
            formType: "date",
            name: "activation_date",
            label: "Activation Date",
            placeholder: "Activation Date",
            required: true,
            dateMinDate: new Date(),
          },
          {
            id: "expiration_date",
            formType: "date",
            name: "expiration_date",
            label: "Expiration Date",
            placeholder: "Expiration Date",
            required: true,
            dateMinDate: new Date(),
          },
        ]}
      />
    </>
  );
}
