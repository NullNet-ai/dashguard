"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
const FormSchema = z.object({
  multi_select_with_options: z
    .array(
      z.object({
        label: z.string({ message: "Label is required" }),
        value: z.string({ message: "Value is required" }),
      }),
    )
    .min(1, { message: "Multi Select with Options is required" }),
  multi_select_single: z
    .array(
      z.object({
        label: z.string({ message: "Label is required" }),
        value: z.string({ message: "Value is required" }),
      }),
    )
    .min(1, { message: "Multi Select Single is required" }),
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
];

const sampleMultiSelectOptionsAlphabetical = [
  { label: "Date", value: "date" },
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Cherry", value: "cherry" },
];
export default function MultiSelectDetails({}) {
  return (
    <>
      {/* FormBuilder 3: Multi Select */}
      <FormBuilder
        handleSubmit={handleSubmit}
        enableFormRegisterToParent
        formLabel="Multi Select Form Builder"
        formKey="FormBuilderMultiSelect"
        formSchema={FormSchema}
        multiSelectOptions={{
          multi_select_with_options: sampleMultiSelectOptionsAlphabetical,
          multi_select_single: sampleMultiSelectOptions,
        }}
        fields={[
          // {
          //   id: "multi-select-creatable",
          //   formType: "multi-select",
          //   name: "multi-select-creatable",
          //   label: "Multi Select Creatable",
          //   required: true,
          //   placeholder: "Multi Select",
          // },
          {
            id: "multi_select_with_options",
            formType: "multi-select",
            name: "multi_select_with_options",
            label: "Multi Select with Options",
            required: true,
          },
          {
            id: "multi_select_single",
            formType: "multi-select",
            name: "multi_select_single",
            label: "Multi Select Single",
            required: true,
            isMultiSelectAlphabetical: false,
            multiSelectMaxSelected: 1,
            multiSelectOnMaxSelected: () => {
              toast.error("Only one value can be selected");
            },
          },
        ]}
      />
    </>
  );
}
