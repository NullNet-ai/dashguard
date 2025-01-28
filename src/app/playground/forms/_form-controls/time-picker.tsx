"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
const FormSchema = z.object({
  "time-picker": z.string({ message: "Time Picker is required" }),
  "time-picker-24": z.string({ message: "Time Picker 24 Hour is required" }),
});

export default function TimePickerDetails() {
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
        console.error("Profile update error", error);
        toast.error("Failed to update profile. Please try again.");
        reject(new Error("Profile update error"));
      }
    });
  };

  return (
    <div>
<FormBuilder
        enableFormRegisterToParent
        formLabel="Time Form"
        formKey="time-sample"
        handleSubmit={handleSave}
        formSchema={FormSchema}
        defaultValues={{
          "time-picker": "02:30 PM",
          "time-picker-24": "02:30",
        }}
        fields={[
          {
            id: "time-picker",
            formType: "time-picker",
            name: "time-picker",
            label: "Time Picker",
            required: true,
          },
          {
            id:"time-picker-24",
            formType: "time-picker",
            name: "time-picker-24",
            label: "Time Picker 24 Hour",
            required: true,
            timePickerProps: {
              is24Hour: true,
            },
          }
        ]}
      />
    </div>
      
  );
}