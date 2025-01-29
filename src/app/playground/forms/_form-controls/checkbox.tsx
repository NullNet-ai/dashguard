"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  favoriteFruits: z
    .array(z.string())
    .min(1, { message: "At least one fruit must be selected" }),
});

export default function FavoriteFruitsForm() {
  const handleSave = async (values: { data: z.infer<typeof FormSchema> }) => {
    try {
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(values.data, null, 2)}
          </code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  return (
    <>
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Favorite Fruits Form"
        formKey="favorite fruits"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        checkboxOptions={{
          favoriteFruits: [
            { label: "Apple", value: true},
            { label: "Banana", value: "banana" },
            { label: "Cherry", value: "cherry" },
            { label: "Date", value: "date" },
            { label: "Elderberry", value: "elderberry" },
          ],
        }}
        fields={[
          {
            id: "favoriteFruits",
            formType: "checkbox",
            name: "favoriteFruits",
            label: "Select Your Favorite Fruits",
            required: true,
            placeholder: "Select at least one fruit",
          },
        ]}
      />
    </>
  );
}
