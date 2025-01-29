"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

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
        defaultValues={{
          "full-name": "John Doe",
        }}
        fields={[
          {
            id: "fullName",
            formType: "input",
            name: "full-name",
            label: "Full Name",
            required: true,
            placeholder: "Enter your full name...",
            readonly:true
          },
        ]}
      />
  );
}