
"use client";

import { FileTextIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  textarea: z
    .string({ required_error: "Textarea is required" })
    .min(10, { message: "Textarea must be at least 10 characters long" }),
});

export default function TextAreaDetails() {
  const handleSave = async (values: { data: z.infer<typeof FormSchema> }) => {
    return new Promise<void>((resolve, reject) => {
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
        console.error("Profile update error", error);
        toast.error("Failed to update profile. Please try again.");
        reject(new Error("Profile update error"));
      }
    });
  };

  return (
    <>
      {/* FormBuilder 10: Textarea */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Textarea Form Builder"
        formKey="text-area"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        fields={[
          {
            id: "textarea",
            formType: "textarea",
            name: "textarea",
            label: "Textarea",
            required: true,
            placeholder: "Textarea",
            textAreaLineWrapping: true,
            textAreaIcon: FileTextIcon,
            textAreaShowCharCount: true,
            textAreaMaxHeight: 658,
            textAreaMaxCharCount: 100,
          },
        ]}
      />
    </>
  );
}
