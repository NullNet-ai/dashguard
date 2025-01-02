"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  input_label_value: z
    .string({ message: "Input Label Value is required" })
    .min(1, { message: "Input Label Value is required" }),
});

export default function InputLabelValueDetails({}) {
  return (
    <>
      {/* FormBuilder 13: Input Label Value*/}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Input Label Value Form Builder"
        formKey="FormBuilderInputLabelValue"
        formSchema={FormSchema}
        fields={[
          {
            id: "input-label-value",
            formType: "input-label-value",
            name: "input-label-value",
            label: "Input Label Value",
            required: true,
            placeholder: "Input Label Value",
          },
        ]}
      />
    </>
  );
}
