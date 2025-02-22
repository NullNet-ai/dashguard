"use client";

import { UserIcon } from 'lucide-react';
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import FormInput from '~/components/platform/FormBuilder/FormType/FormInput';

const FormSchema = z.object({
  "full-name": z
    .string({ message: "Full Name is required" })
    .min(2, { message: "Full Name must be at least 2 characters long" }),
});

export default function UserProfileForm() {
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
      <FormBuilder
        enableFormRegisterToParent
        formLabel="User Profile Form"
        formKey="user-profile"
        handleSubmit={handleSave}
        formSchema={FormSchema}
        fields={[
          {
            id: "full-name",
            type: "custom-field",
            label: "Full Name",
            placeholder: "Enter your full name",
            required: true,
            name: "full-name",
            render: ({ fieldConfig,form,field,fieldState,formKey }) => (
              <div className="flex gap-2">
                {field.name}
               <FormInput fieldConfig={fieldConfig} form={form} formKey={formKey} formRenderProps={{field,fieldState}} />
              </div>
            )
          },
        ]}
      />
  );
}