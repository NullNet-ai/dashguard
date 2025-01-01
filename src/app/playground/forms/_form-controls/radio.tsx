"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  radio: z
    .string({ message: "Radio is required" })
    .min(1, { message: "Radio is required" }),
});

export default function RadioDetails({}) {
  const handleSave = (values: {
    data: z.infer<typeof FormSchema>;
  }): Promise<void> => {
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
  };

  return (
    <>
      {/* FormBuilder 5: Radio */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Radio Form Builder"
        formKey="FormBuilderRadio"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        radioOptions={{
          radio: [
            { label: "Radio 1", value: "radio1" },
            { label: "Radio 2", value: "radio2" },
            { label: "Radio 3", value: "radio3" },
          ],
        }}
        fields={[
          {
            id: "radio",
            formType: "radio",
            name: "radio",
            label: "Radio",
            required: true,
            placeholder: "Radio",
          },
        ]}
      />
    </>
  );
}
