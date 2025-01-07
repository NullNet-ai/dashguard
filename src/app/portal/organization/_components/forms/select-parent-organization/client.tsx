"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types/global/interfaces";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

// const CustomAddressSchema = z.object({
//   address: z.object({
//     address1: z.string().min(1, { message: "Address line 1 is required" }),
//     address2: z.string().optional(),
//     city: z.string().min(1, { message: "City is required" }),
//     region: z.string().min(1, { message: "State is required" }),
//     postalCode: z.string().min(1, { message: "Postal code is required" }),
//   }),
// });

// const FormSchema = Contact.ZodSchema.extend(CustomAddressSchema.shape)
const FormSchema = z.object({
  name: z.string().min(1),
});

export default function SelectParentOrganization({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateCreditCard = api.organization.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    await updateCreditCard.mutateAsync({
      id: params.id,
      name: data.name,
    });

    try {
      toast.success("Basic Details submit sucessfully");
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Parent Organization"
      handleSubmit={handleSave}
      formKey="OrganizationTwo"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[
        {
          id: "parent_organization_id",
          formType: "select",
          name: "parent_organization_id",
          label: "Parent Organization",
          required: true,
        },
      ]}
    />
  );
}
