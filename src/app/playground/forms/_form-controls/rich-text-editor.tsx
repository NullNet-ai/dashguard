"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  rich_text_editor: z
    .string({ message: "RichTextEditor is required" })
    .min(1, { message: "RichTextEditor is required" }),
});


function handleSubmit(values: {
  data: z.infer<typeof FormSchema>;
}): Promise<void> {
  return new Promise((resolve, reject) => {
      try {
          toast(
              <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                  <code className="text-white">
                      {JSON.stringify(values.data, null, 2)}
                  </code>
              </pre>,
          );
          resolve();
      } catch (error) {
          console.error("Form submission error", error);
          toast.error("Failed to submit the form. Please try again.");
          reject(new Error("Form submission error"));
      }
  });
}
export default function RichTextEditorDetails({}) {
  return (
    <>
      {/* FormBuilder 7: Rich Text Editor */}
      <FormBuilder
        customDesign={{
          formClassName: "w-full",
          headerClassName: "text-lg",
        }}
        handleSubmit={handleSubmit}
        enableFormRegisterToParent
        formLabel="Rich Text Editor Form Builder"
        formKey="FormBuilderRichText"
        formSchema={FormSchema}
        fields={[
          {
            id: "rich_text_editor",
            formType: "rich-text-editor",
            name: "rich_text_editor",
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
