"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  inputs: z
    .string({ message: "Inputs is required" })
    .min(1, { message: "Inputs is required" }),
});

export default function InputsDetails({}) {
  return (
    <>
      {/* FormBuilder 12: Inputs */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Inputs Form Builder"
        formKey="FormBuilderInputs"
        formSchema={FormSchema}
        fields={[
          {
            id: "inputs",
            formType: "inputs",
            name: "inputs",
            label: "Inputs",
            required: true,
            placeholder: "Inputs",
          },
        ]}
      />
    </>
  );
}
