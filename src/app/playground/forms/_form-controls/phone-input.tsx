"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";
import { PhoneArraySchema } from "~/server/zodSchema/contact/contactPhoneEmail";

export default function PhoneInputDetails({}) {

const PhoneSchema = z.object({
  "phone-input": PhoneArraySchema
});

const handleSave = async (values: { data: z.infer<typeof PhoneSchema> }) => {
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
      {/* FormBuilder 16: Phone Input */}
      <FormBuilder
        handleSubmit={handleSave}
        enableFormRegisterToParent
        formLabel="Phone Input Form Builder"
        formKey="FormBuilderPhoneInput"
        formSchema={PhoneSchema}
        fields={[
          {
            id: "phone-input",
            formType: "phone-input",
            name: "phone-input",
            label: "Phone Input",
            required: true,
            placeholder: "Phone Input",
            options: {
              phoneNumberType: "multiple",
            }
          },
        ]}
      />
    </>
  );
}
