"use client";
import { Moon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

export default function Page() {
  const FormSchema = z.object({
    switch: z.boolean(),
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
      <FormBuilder
        fields={[
          {
            id: "switch",
            name: "switch",
            formType: "switch",
            label: "Switch",
            switchConfig: {
              icon: <Moon />,
              leftLabel: "Off",
              rightLabel: "On",
            },
          },
        ]}
        formKey="switch"
        formSchema={FormSchema}
        handleSubmit={onSubmit}
      />
  );
}
