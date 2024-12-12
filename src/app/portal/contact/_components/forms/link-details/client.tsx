"use client";

import { type z } from "zod";
import { api } from "~/trpc/react";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { LinkDetailsSchema } from "~/server/zodSchema/contacts/linkDetails";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import CustomLinkDetails from "./custom/LinkDetails";
import { type IFormProps } from "../types";

export default function LinkDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();

  const updateLinks = api.contactLink.saveLinks.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof LinkDetailsSchema>>) => {
    try {
      const response = await updateLinks.mutateAsync({
        contact_id: params.id,
        links: data?.links,
      });
      if (response) return toast.success("Link Details submitted successfully");
      return response;
    } catch (error) {
      toast.error("Failed to submit Link Details");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "w-full",
      }}
      myParent={params.shell_type}
      enableAppendForm={true}
      appendFormKey="test-form-button"
      formProps={params}
      formLabel="Link"
      handleSubmit={handleSave}
      formKey="contact-link-details"
      formSchema={LinkDetailsSchema}
      defaultValues={defaultValues}
      fields={[]}
      customRender={(form, options) => (
        <CustomLinkDetails
          form={form}
          options={{
            ...options,
            appendFormKey: options?.appendButtonKey || "",
          }}
        />
      )}
    />
  );
}
