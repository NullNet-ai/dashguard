"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { EmailArraySchema } from "~/server/zodSchema/contacts/basicDetails";
const FormSchema = z.object({
  email_input: EmailArraySchema,
  emails: EmailArraySchema,
});

export default function EmailInputDetails({}) {
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
        console.error("Form submission error", error);
        toast.error("Failed to submit the form. Please try again.");
        reject(new Error("Form submission error"));
      }
    });
  };
  return (
    <>
      {/* FormBuilder 15: Email Input */}
      <FormBuilder
        enableFormRegisterToParent
        handleSubmit={handleSave}
        formLabel="Email Input Form Builder"
        formKey="FormBuilderEmailInput"
        formSchema={FormSchema}
        fields={[
          {
            id: "email_input",
            formType: "email-input",
            name: "email_input",
            label: "Email Multiple Input",
            required: true,
            placeholder: "Email Multiple Input",
            options: {
              phoneEmailType: "single",
            },
          },
          {
            id: "emails",
            formType: "email-input",
            name: "emails",
            label: "Email Multiple Input",
            required: true,
            placeholder: "Email Multiple Input",
            options: {
              phoneEmailType: "multiple",
            },
          },
        ]}
      />
    </>
  );
}
