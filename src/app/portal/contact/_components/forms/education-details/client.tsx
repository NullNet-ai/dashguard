"use client";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { z } from "zod";
import { IFormProps } from "./types";
import { EducationDetailsSchema } from "~/server/zodSchema/contacts/educationDetails";
import CustomEducationDetails from "./custom/EducationDetails";

export default function EducationDetails({
  params,
  selectOptions,
  defaultValues,
}: IFormProps) {
  const utils = api.useUtils();
  const toast = useToast();
  const updateEducationDetails = api.education.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof EducationDetailsSchema>>) => {
    try {
      const contact_id = params.id!;

      const response = await updateEducationDetails.mutateAsync({
        contact_id,
        educations: data?.educations,
      });
      await utils.contact.invalidate();
      toast.success("Education Details submitted sucessfully");
      return response;
    } catch (error) {
      toast.error("Failed to submit Education Details");
    }
  };

  return (
    <>
      <FormBuilder
        customDesign={{
          formClassName: "w-full",
        }}
        myParent={params.shell_type}
        enableFormRegisterToParent
        enableAppendForm={true}
        appendFormKey="education-form-button"
        formProps={params}
        formLabel="Education Details"
        handleSubmit={handleSave}
        formKey="ContactsEducationDetails"
        formSchema={EducationDetailsSchema}
        defaultValues={defaultValues}
        selectOptions={selectOptions}
        fields={[]}
        customRender={(form, options) => (
          <CustomEducationDetails
            form={form}
            params={params}
            selectOptions={selectOptions || {}}
            options={{
              ...options,
              appendFormKey: options?.appendButtonKey || "",
            }}
          />
        )}
      />
    </>
  );
}
