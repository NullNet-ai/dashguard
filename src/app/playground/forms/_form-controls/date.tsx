"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  date: z
    .string({ message: "Date is required" })
    .min(1, { message: "Date is required" }),
});

export default function DateDetails({}) {
  return (
    <>
      {/* FormBuilder 6: Date */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Date Form Builder"
        formKey="FormBuilderDate"
        formSchema={FormSchema}
        fields={[
          {
            id: "date",
            formType: "date",
            name: "date",
            label: "Date",
            required: true,
            placeholder: "Date",
          },
        ]}
      />
    </>
  );
}
