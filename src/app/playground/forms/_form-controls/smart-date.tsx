"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  "smart-date": z
    .string({ message: "Date is required" })
    .min(1, { message: "Date is required" })
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of the day
      return selectedDate >= today;
    }, { message: "Date cannot be in the past" }),
  "smart-date-with-custom-time": z
    .string({ message: "Date is required" })
    .min(1, { message: "Date is required" })
});

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

export default function SmartDateDetails({ }) {
  return (
    <>
      {/* FormBuilder 6: Date */}
      <FormBuilder
        defaultValues={{
          "smart-date": new Date().toISOString(),
          "smart-date-24h": new Date().toISOString(),
          "smart-date-yyyy-mm-dd": new Date().toISOString(),
          "smart-date-yyyy-mm-dd-12h": new Date().toISOString()
        }}
        enableFormRegisterToParent
        formLabel="Date Form Builder"
        formKey="FormBuilderDate"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        fields={[
          {
            id: "smart-date",
            formType: "smart-date",
            name: "smart-date",
            label: "Smart Date with External Time Picker (12-hour)",
            required: true,
            placeholder: "Smart Date",
            dateTimePickerProps: {
              disablePastDates: true,
              includeTime: true,
              useTimePicker: true,
              is24Hour: false // Explicitly set to 12-hour format
            }
          },
          {
            id: "smart-date-24h",
            formType: "smart-date",
            name: "smart-date-24h",
            label: "Smart Date with External Time Picker (24-hour)",
            required: true,
            placeholder: "Smart Date",
            dateTimePickerProps: {
              disablePastDates: true,
              includeTime: true,
              useTimePicker: true,
              is24Hour: true // Explicitly set to 24-hour format
            }
          },
          {
            id: "smart-date-yyyy-mm-dd",
            formType: "smart-date",
            name: "smart-date-yyyy-mm-dd",
            label: "Smart Date with YYYY-MM-DD Format (defaults to 24-hour)",
            required: true,
            placeholder: "Smart Date",
            dateTimePickerProps: {
              disablePastDates: true,
              includeTime: true,
              useTimePicker: true,
              displayFormat: "YYYY-MM-DD" // Will default to 24-hour format
            }
          },
          {
            id: "smart-date-yyyy-mm-dd-12h",
            formType: "smart-date",
            name: "smart-date-yyyy-mm-dd-12h",
            label: "Smart Date with YYYY-MM-DD Format (12-hour)",
            required: true,
            placeholder: "Smart Date",
            dateTimePickerProps: {
              disablePastDates: true,
              includeTime: true,
              useTimePicker: true,
              displayFormat: "YYYY-MM-DD",
              is24Hour: false
            }
          }
        ]}
      />
    </>
  );
}
