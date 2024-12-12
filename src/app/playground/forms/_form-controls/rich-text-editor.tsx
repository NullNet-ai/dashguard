"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
const FormSchema = z.object({
  rich_text_editor: z
    .string({ message: "RichTextEditor is required" })
    .min(1, { message: "RichTextEditor is required" }),
});

export default function RichTextEditorDetails({}) {
  return (
    <>
      {/* FormBuilder 7: Rich Text Editor */}
      <FormBuilder
        customDesign={{
          formClassName: "w-full",
          headerClassName: "text-lg",
        }}
        enableFormRegisterToParent
        formLabel="Rich Text Editor Form Builder"
        formKey="FormBuilderRichText"
        formSchema={FormSchema}
        fields={[
          {
            id: "richtext",
            formType: "rich-text-editor",
            name: "richtext",
            label: "Rich Text Editor",
            required: true,
            placeholder: "Rich Text Editor",
            className: "w-full",
          },
        ]}
      />
    </>
  );
}
