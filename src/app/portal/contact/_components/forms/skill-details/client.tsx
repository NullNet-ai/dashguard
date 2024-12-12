"use client";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { z } from "zod";
import { IFormProps } from "./types";
import { SkillDetailsSchema } from "~/server/zodSchema/contacts/skillDetails";
import CustomSkillDetails from "./custom/SkillDetails";

export default function SkillDetails({
  params,
  selectOptions,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateSkillDetails = api.contactSkill.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof SkillDetailsSchema>>) => {
    try {
      const response = await updateSkillDetails.mutateAsync({
        contact_id: params.id,
        skills: data.skills,
      });
      toast.success("Skill Details submitted sucessfully");
      return response;
    } catch (error) {
      toast.error("Failed to submit Skill Details");
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
        appendFormKey="test-form-button"
        formProps={params}
        formLabel="Skill Details"
        handleSubmit={handleSave}
        formKey="contact-skill-details"
        formSchema={SkillDetailsSchema}
        defaultValues={defaultValues}
        fields={[]}
        customRender={(form, options) => (
          <CustomSkillDetails
            form={form}
            selectOptions={selectOptions ?? {}}
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
