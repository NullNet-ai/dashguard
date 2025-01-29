"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";

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
export default function SmartDateDetails({}) {
  

  return (
    <>
      {/* FormBuilder 6: Date */}
      <FormBuilder
      // defaultValues={{
      //   "smart-date":"11/20/2024"
      // }}
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
            label: "Smart Date",
            required: true,
            placeholder: "Smart Date",
            dateTimePickerProps:{
              disablePastDates: true,
            }
          },
        ]}
      />
    </>
  );
}
