"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  pay_period: z
    .string({ message: "Pay Period is required" })
    .min(1, { message: "Pay Period is required" })
    .nullable()
    .refine((val) => val !== null, { message: "Pay Period is required" }),
});

export default function PayPeriodDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updatePayPeriod = api.payPeriod.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updatePayPeriod.mutateAsync({
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
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="PayPeriodDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "pay_period",
          formType: "input",
          name: "pay_period",
          label: "Pay Period",
          required: true,
          placeholder: "Pay Period",
        },
      ]}
    />
  );
}
