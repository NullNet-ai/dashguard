"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  age: z
    .number({ message: "Age is required" })
    .min(1, { message: "Age must be at least 1" }),
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
        formLabel="Age Form Builder"
        formKey="employee"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        fields={[
          {
            id: "age",
            formType: "number-input",
            name: "age",
            label: "Age",
            required: true,
            placeholder: "Enter your age",
          },
        ]}
      />
    </>
  );
}
