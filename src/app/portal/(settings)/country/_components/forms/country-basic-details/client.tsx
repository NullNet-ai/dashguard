"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "./types";

const FormSchema = z.object({
  country: z
    .string({ message: "Country is required" })
    .min(1, { message: "Country is required" }),
});

export default function CountryBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateCountry = api.country.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateCountry.mutateAsync({
        id: params.id,
        ...data,
      });
      if (res.status_code == 200) {
        toast.success("Basic Details submit sucessfully");
      }
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
        formKey="CountryBasicDetails"
        formSchema={FormSchema}
        defaultValues={defaultValues}
        fields={[
          {
            id: "country",
            formType: "input",
            name: "country",
            label: "Country",
            required: true,
            placeholder: "Country",
          },
        ]}
      />
    </>
  );
}
