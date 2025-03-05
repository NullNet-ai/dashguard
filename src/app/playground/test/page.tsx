"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  // Modified schema to accept string arrays
  string_values_multi_select: z
    .array(z.string())
    .min(1, { message: "String Values Multi Select is required" }),
  // Keep one regular multi-select for comparison
  regular_multi_select: z
    .array(
      z.object({
        label: z.string({ message: "Label is required" }),
        value: z.string({ message: "Value is required" }),
      }),
    )
    .min(1, { message: "Regular Multi Select is required" }),
});

function handleSubmit(values: {
  data: z.infer<typeof FormSchema>;
}): Promise<void> {
  return new Promise((resolve) => {
    toast(
      <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        <code className="text-white">
          {JSON.stringify(values.data, null, 2)}
        </code>
      </pre>,
    );
    resolve();
  });
}

const sampleMultiSelectOptions = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
];

export default function MultiSelectStringValuesTest() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">MultiSelect useStringValues Test</h1>
      
      <FormBuilder
        handleSubmit={handleSubmit}
        formLabel="String Values Test"
        formKey="StringValuesTest"
        formSchema={FormSchema}
        defaultValues={{
          string_values_multi_select: ["apple", "banana"],
          regular_multi_select: [{ label: "Apple", value: "apple" }],
        }}
        multiSelectOptions={{
          string_values_multi_select: sampleMultiSelectOptions,
          regular_multi_select: sampleMultiSelectOptions,
        }}
        fields={[
          {
            id: "string_values_multi_select",
            formType: "multi-select",
            name: "string_values_multi_select",
            label: "String Values Multi Select",
            required: true,
            multiSelectUseStringValues: true, // Enable string values mode
            description: "This multi-select uses string[] values instead of Option[]",
          },
          {
            id: "regular_multi_select",
            formType: "multi-select",
            name: "regular_multi_select",
            label: "Regular Multi Select",
            required: true,
            description: "This multi-select uses the standard Option[] values",
          },
        ]}
      />
      
      <div className="mt-8 rounded-md border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 font-semibold">Expected behavior:</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>The first multi-select should store and return string values</li>
          <li>The second multi-select should store and return Option objects</li>
          <li>Check the form submission output to verify the data structure</li>
        </ul>
      </div>
    </div>
  );
}
