"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { PositionPostingsSchema } from "~/server/zodSchema/positions/positionPostings";
import { IFormProps } from "../types";
import CustomPostingDetails from "../Custom/PostingDetails";

export default function PostingDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const utils = api.useUtils();
  const toast = useToast();
  const updateEducationDetails = api.positionPosting.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof PositionPostingsSchema>>) => {
    try {
      const position_id = params.id!;

      const response = await updateEducationDetails.mutateAsync({
        position_id,
        postings: data?.postings,
      });
      await utils.contact.invalidate();
      toast.success("Posting Details submit sucessfully");
      return response;
    } catch (error) {
      toast.error("Failed to submit Posting Details");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "w-full",
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent
      enableAppendForm={true}
      appendFormKey="posting-form-button"
      formProps={params}
      formLabel="Postings"
      handleSubmit={handleSave}
      formKey="PositionPostingDetails"
      formSchema={PositionPostingsSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[]}
      customRender={(form, options) => (
        <CustomPostingDetails
          form={form}
          params={params}
          options={{
            ...options,
            appendFormKey: options?.appendButtonKey || "",
          }}
        />
      )}
    />
  );
}
