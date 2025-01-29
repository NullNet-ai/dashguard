"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { EmailArraySchema } from "~/server/zodSchema/contact/contactPhoneEmail";

const FormSchema = z.object({
"primary-email": EmailArraySchema.optional(),
  "secondary-emails": EmailArraySchema.optional(),
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
      {/* FormBuilder: Email Input */}
      <FormBuilder
      defaultValues={{
      "secondary-emails": [
      
      ]
      }}
      enableFormRegisterToParent
      handleSubmit={handleSave}
      formLabel="Email Input Form"
      formKey="email-input-form"
      formSchema={FormSchema}
      fields={[
        // {
        // id: "primary_email",
        // formType: "email-input",
        // name: "primary-email",
        // label: "Primary Email",
        // required: true,
        // placeholder: "Enter your primary email",
        // },
        {
        id: "secondary_emails",
        formType: "email-input",
        name: "secondary-emails",
        label: "Secondary Emails",
        required: false,
        placeholder: "Enter secondary emails",
        options: {
          phoneEmailType: "multiple",
        },
        },
      ]}
      />
    </>
  );
}
