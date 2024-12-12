"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  textfield: z
    .string({ message: "Text Field is required" })
    .min(1, { message: "Text Field is required" }),
});

export default function InputDetails({}) {

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
      {/* FormBuilder 1: TextField */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="TextField Form Builder"
        formKey="FormBuilderTextField"
        handleSubmit={handleSave}
        formSchema={FormSchema}
        fields={[
          {
            id: "textfield",
            formType: "input",
            name: "textfield",
            label: "TextField",
            required: true,
            placeholder: "TextField",
          },
        ]}
      />
    </>
  );
}
