"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  date_range: z
    .string({ message: "Date Range is required" })
    .min(1, { message: "Date Range is required" }),
});

export default function DateRangeDetails({}) {
  return (
    <>
      {/* FormBuilder 14: Date Range */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Date Range Form Builder"
        formKey="FormBuilderDateRange"
        formSchema={FormSchema}
        fields={[
          {
            id: "date-range",
            formType: "date-range",
            name: "date-range",
            label: "Date Range",
            required: true,
            placeholder: "Date Range",
          },
        ]}
      />
    </>
  );
}
