"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";

const FormSchema = z.object({
  file: z
    .string({ message: "File is required" })
    .min(1, { message: "File is required" }),
});

export default function FileDetails({}) {
  return (
    <>
      {/* FormBuilder 11: File */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="File Form Builder"
        formKey="FormBuilderFile"
        formSchema={FormSchema}
        fields={[
          {
            id: "file",
            formType: "file",
            name: "file",
            label: "File",
            required: true,
            placeholder: "File",
          },
        ]}
      />
    </>
  );
}
