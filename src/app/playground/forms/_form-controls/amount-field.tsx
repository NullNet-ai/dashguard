"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";
const FormSchema = z.object({
  amount: z.object({
    amount: z.number({ message: "Amount is required" }),
    currency: z
      .string({ message: "Currency is required" })
      .min(1, { message: "Currency is required" }),
  }),
});

export default function AmountDetails({}) {
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
      {/* FormBuilder 18: Amount */}
      <FormBuilder
      defaultValues={{
        amount: {
          amount: 1000,
          currency: "USD",
        },
      }}
        enableFormRegisterToParent
        formLabel="Amount Form Builder"
        formKey="FormBuilderCurrency"
        handleSubmit={handleSave}
        formSchema={FormSchema}
        fields={[
          {
            id: "amount",
            formType: "currency-input",
            name: "amount",
            label: "Amount",
            required: true,
            placeholder: "Amount",
          },
        ]}
      />
    </>
  );
}
