"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";

const FormSchema = z.object({
  checkbox: z
    .array(z.string(), { message: "At least one checkbox must be selected" })
    .refine((val) => val.length > 0, {
      message: "At least one checkbox must be selected",
    }),
});

export default function CheckboxDetails({}) {
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
      {/* FormBuilder 4: Checkbox */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Checkbox Form Builder"
        formKey="FormBuilderCheckbox"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        checkboxOptions={{
          checkbox: [
            { label: "Checkbox 1", value: "checkbox1" },
            { label: "Checkbox 2", value: "checkbox2" },
            { label: "Checkbox 3", value: "checkbox3" },
          ],
        }}
        fields={[
          {
            id: "checkbox",
            formType: "checkbox",
            name: "checkbox",
            label: "Checkbox",
            required: true,
            placeholder: "Checkbox",
          },
        ]}
      />
    </>
  );
}
