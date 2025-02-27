"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { Toaster } from '~/components/ui/sonner';

const FormSchema = z.object({
  multi_select_with_options: z
    .array(
      z.object({
        label: z.string({ message: "Label is required" }),
        value: z.string({ message: "Value is required" }),
      }),
    )
    .min(1, { message: "Multi Select with Options is required" }),
});
function handleSubmit(values: {
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

const sampleMultiSelectOptions = [
  { label: "Date", value: "date" },
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Cherry", value: "cherry" },
  { label: "Fig", value: "fig" },
  { label: "Grape", value: "grape" },
  { label: "Honeydew", value: "honeydew" },
  { label: "Kiwi", value: "kiwi" },
  { label: "Lemon", value: "lemon" },
  { label: "Mango", value: "mango" },
  { label: "Nectarine", value: "nectarine" },
  { label: "Orange", value: "orange" },
  { label: "Papaya", value: "papaya" },
  { label: "Quince", value: "quince" },
  { label: "Raspberry", value: "raspberry" },
  { label: "Strawberry", value: "strawberry" },
  { label: "Tomato", value: "tomato" },
  { label: "Ugli Fruit", value: "ugli_fruit" },
  { label: "Watermelon", value: "watermelon" },
];

const sampleMultiSelectOptionsAlphabetical = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Fig", value: "fig" },
  { label: "Grape", value: "grape" },
  { label: "Honeydew", value: "honeydew" },
  { label: "Kiwi", value: "kiwi" },
  { label: "Lemon", value: "lemon" },
  { label: "Mango", value: "mango" },
  { label: "Nectarine", value: "nectarine" },
  { label: "Orange", value: "orange" },
  { label: "Papaya", value: "papaya" },
  { label: "Quince", value: "quince" },
  { label: "Raspberry", value: "raspberry" },
  { label: "Strawberry", value: "strawberry" },
  { label: "Tomato", value: "tomato" },
  { label: "Ugli Fruit", value: "ugli_fruit" },
  { label: "Watermelon", value: "watermelon" },
];
export default function MultiSelectDetails({}) {
  return (
    <>
    <Toaster />
      {/* FormBuilder 3: Multi Select */}
      <FormBuilder
        handleSubmit={handleSubmit}
        enableFormRegisterToParent
        formLabel="Multi Select Form Builder"
        formKey="FormBuilderMultiSelect"
        formSchema={FormSchema}
        multiSelectOptions={{
        //   multi_select_single: sampleMultiSelectOptions,
        }}
        fields={[
          {
            id: "multi_select_single",
            formType: "multi-select",
            name: "multi_select_single",
            label: "Multi Select Single",
            required: true,
            multiSelectEnableCreate: true,
            isMultiSelectAlphabetical: false,
            multiSelectShowCreatableItem: false,
            multiSelectOnMaxSelected: () => {
              toast.error("Only one value can be selected");
            },
            
          },
        ]}
      />
    </>
  );
}
