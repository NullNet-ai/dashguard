"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";

const FormSchema = z.object({
  "smart-date": z
    .string({ message: "Date is required" })
    .min(1, { message: "Date is required" }),
});

export default function SmartDateDetails({}) {
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
            id: "smart-date",
            formType: "smart-date",
            name: "smart-date",
            label: "Smart Date",
            required: true,
            placeholder: "Smart Date",
          },
        ]}
      />
    </>
  );
}
