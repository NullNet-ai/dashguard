"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";
import { updatePositionDescriptionDetails } from "../Action/createUpdatePositionRequirementDetails";

const FormSchema = z.object({
  responsibility: z.string().nullable().optional(),
});

export default function PositionDetailsResponsibilitiesForm({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updatePositionDescriptionDetails({
        id: params.id,
        responsibility: data?.responsibility ?? "",
      });
      const { success, status_code } = res || {};
      if (status_code === 409) {
        return res; // Needs to return since this is handled by form submit
      }
      if (success) {
        toast.success("Basic Details submit sucessfully");
        return res;
      }
      return res;
    } catch (error) {
      toast.error("Failed to submit Position Details");
    }
  };

  return (
    <>
      <FormBuilder
        myParent={params.shell_type}
        enableFormRegisterToParent
        formProps={params}
        formLabel="Responsibilities"
        handleSubmit={handleSave}
        formKey="responsibilities"
        formSchema={FormSchema}
        defaultValues={defaultValues}
        fields={[
          {
            id: "responsibility",
            formType: "textarea",
            name: "responsibility",
            label: "Responsibilities",
            placeholder: "Responsibilities",
            required: false,
          },
        ]}
      />
    </>
  );
}
