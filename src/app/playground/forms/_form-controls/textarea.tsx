"use client";

import { UserIcon } from "lucide-react";
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";

const FormSchema = z.object({
  textarea: z
    .string({ required_error: "Textarea is required" })
    .min(10, { message: "Textarea must be at least 10 characters long" }),
});

export default function TextAreaDetails({}) {
  return (
    <>
      {/* FormBuilder 10: Textarea */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Textarea Form Builder"
        formKey="text-area"
        formSchema={FormSchema}
        fields={[
          {
            id: "textarea",
            formType: "textarea",
            name: "textarea",
            label: "Textarea",
            required: true,
            placeholder: "Textarea",
            textAreaLineWrapping:true,
            textAreaIcon: UserIcon,
            textAreaShowCharCount:true,
            textAreaMaxHeight: 658,
            textAreaMaxCharCount:100
          },
        ]}
      />
    </>
  );
}
