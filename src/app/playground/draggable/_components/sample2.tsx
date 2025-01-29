"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  draggable2: z.array(
    z.object({
      "user-name": z
        .string({ message: "User Name is required" })
        .min(2, { message: "User Name must be at least 2 characters long" }),
      userEmail: z
        .string({ message: "User Email is required" })
        .email({ message: "Invalid email address" }),
    })
  )
})

export default function UserProfileForm2() {
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
      formLabel="User Profile Form2"
      formKey="user-profile2"
      handleSubmit={handleSave}
      formSchema={FormSchema}
      fields={[
        {
          id: "draggable2",
          formType: "draggable",
          name: "draggable2",
          label: "Draggable2",
          draggableConfig: [
            {
              fields: {
                id: "userBio",
                formType: "textarea",
                name: "userBio",
                label: "User Bio",
                required: true,
                placeholder: "Enter your bio...",
              },
            },
            {
              fields: {
                id: "userGender",
                formType: "radio",
                name: "userGender",
                label: "Gender",
                required: true,
                radioOptions: [
                  {
                    value: "male",
                    label: "Male",
                  },
                  {
                    value: "female",
                    label: "Female",
                  },
                  {
                    value: "other",
                    label: "Other",
                  },
                ],
              },
            },
            {
              fields: {
                id: "userAge",
                formType: "number-input",
                name: "userAge",
                label: "Age",
                required: true,
                placeholder: "Enter your age...",
              },
            }
          ],
        },
        {
          id: "draggable3",
          formType: "draggable",
          name: "draggable3",
          label: "Draggable3",
          draggableConfig:[
            {
              fields:{
                id: "dateOfBirth",
                formType: "smart-date",
                name: "dateOfBirth",
                label: "Date of Birth",
                required: true,
                placeholder: "Select your date of birth...",
              }
            },
            {
              fields:{
                id: "timepicker",
                formType: "time-picker",
                name: "timepicker",
                label: "Time Picker",
                required: true,
                placeholder: "Select your time...",
              }
            }
          ]

        }
      ]}
    />
  );
}
