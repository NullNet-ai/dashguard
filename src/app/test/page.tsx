"use client";;
import { use } from "react";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { contactDetailsSchema } from "~/server/zodSchema/contact/contactDetails";

export default function Page(props: any) {
  const params = use(
    props.params as Promise<{
      id: string;
      shell_type?: "record" | "wizard";
    }>,
  );

  const {
    defaultValues,
    selectOptions,
    multiSelectOptions
  } = props;

  const toast = useToast();
  const updateContact = api.contact.updateContactDetails.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof contactDetailsSchema>>) => {
    try {
      const response = await updateContact.mutateAsync({
        ...data,
        id: params.id,
      });
      if (response?.success) {
        const { data } = response;
        toast.success("Contact Details submit successfully");
        return data;
      }
      throw new Error("Failed to submit Contact Details");
    } catch {
      toast.error("Failed to submit Contact Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Contact Details"
      handleSubmit={handleSave}
      formKey="contact_details"
      formSchema={contactDetailsSchema}
      defaultValues={defaultValues}
      multiSelectOptions={multiSelectOptions}
      selectOptions={selectOptions}
      fields={[
        {
          id: "address",
          formType: "address-input",
          name: "Address",
          placeholder: "Address",
          label: "Address",
        },
      ]}
    />
  );
}
