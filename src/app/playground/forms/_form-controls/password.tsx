"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .refine((value) => /[A-Z]/.test(value), {
      message: "Password must contain at least one uppercase letter.",
    })
    .refine((value) => /[a-z]/.test(value), {
      message: "Password must contain at least one lowercase letter.",
    })
    .refine((value) => /[0-9]/.test(value), {
      message: "Password must contain at least one number.",
    })
    .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), {
      message: "Password must contain at least one special character.",
    }),
});

export default function PasswordDetails({}) {
  function handleSave(values: {
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

  return (
    <>
      {/* FormBuilder: User Registration Password */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="User Registration"
        formKey="user-registration"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        fields={[
          {
            id: "password",
            formType: "password",
            name: "password",
            label: "Create Password",
            required: true,
            placeholder: "Enter your password",
          },
        ]}
      />
    </>
  );
}
