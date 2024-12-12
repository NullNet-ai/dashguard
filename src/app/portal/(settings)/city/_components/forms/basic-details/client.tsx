"use client";

import { z } from "zod";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { IFormProps } from "../types";

const FormSchema = z.object({
  city: z
    .string({ message: "City is required" })
    .min(1, { message: "City is required" }),
  country_id: z
    .string({ message: "City is required" })
    .min(1, { message: "City is required" }),
});

export default function CityBasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateCity = api.city.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateCity.mutateAsync({
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
        formKey="city"
        formSchema={FormSchema}
        defaultValues={defaultValues}
        selectOptions={selectOptions}
        fields={[
          {
            id: "country_id",
            formType: "select",
            name: "country_id",
            label: "Country",
            required: true,
            placeholder: "Country",
          },
          {
            id: "city",
            formType: "input",
            name: "city",
            label: "City",
            required: true,
            placeholder: "City",
          },
        ]}
      />
    </>
  );
}
