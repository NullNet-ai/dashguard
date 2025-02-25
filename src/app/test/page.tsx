"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { Button } from '~/components/ui/button';
import { FormItem, FormLabel } from '~/components/ui/form';
const FormSchema = z.object({
  "full-name": z
    .string({ message: "Full Name is required" })
    .min(2, { message: "Full Name must be at least 2 characters long" }),
  "gender": z.string({ message: "Gender is required" }),
  "bio": z.string().optional(),
  "dob": z
    .string({ message: "Date of Birth is required" })
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
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
          formType: "custom-field",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
          name: "full-name",
          render: ({ field, fieldConfig, fieldState, }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{fieldConfig.label}</FormLabel>
              <input
                {...field}
                value={field.value ?? ""}
                className={`${fieldState.error && "border-red-500 border-2"}`}
              />
            </FormItem>
          ),
        },
        {
          id: "gender",
          formType: "custom-field",
          label: "Gender",
          placeholder: "Select your gender",
          required: true,
          name: "gender",
          render: ({ field, fieldConfig, fieldState }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{fieldConfig.label}</FormLabel>
              <select
                {...field}
                className={`${fieldState.error && "border-red-500 border-2"}`}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormItem>
          ),
        },
        {
          id: "bio",
          formType: "custom-field",
          label: "Bio",
          placeholder: "Tell us about yourself",
          required: false,
          name: "bio",
          render: ({ field, fieldConfig, fieldState }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{fieldConfig.label}</FormLabel>
              <textarea
                {...field}
                placeholder={fieldConfig.placeholder}
                className={`${fieldState.error && "border-red-500 border-2"}`}
              />
            </FormItem>
          ),
        },
        {
          id: "dob",
          formType: "custom-field",
          label: "Date of Birth",
          placeholder: "Enter your date of birth",
          required: true,
          name: "dob",
          render: ({ field, fieldConfig, fieldState,form }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{fieldConfig.label}</FormLabel>
              <input
                type="date"
                {...field}
                value={field.value ?? ""}
                className={`${fieldState.error && "border-red-500 border-2"}`}
              />
              <Button onClick={() => { form.reset() }} type='reset'>
                Reset
              </Button>
            </FormItem>
          ),
        },
      ]}
    />
  );
}