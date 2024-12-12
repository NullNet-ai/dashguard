"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";

const FormSchema = z.object({
  number_input: z
    .number({ message: "Number Input is required" })
    .min(1, { message: "Number Input must be at least 1" }),
});

export default function NumberInputDetails({}) {
  function handleSave(values: {
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
  return (
    <>
      {/* FormBuilder 8: Number */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Number Form Builder"
        formKey="FormBuilderNumber"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        fields={[
          {
            id: "number_input",
            formType: "number-input",
            name: "number_input",
            label: "Number",
            required: true,
            placeholder: "Number",
          },
        ]}
      />
    </>
  );
}
