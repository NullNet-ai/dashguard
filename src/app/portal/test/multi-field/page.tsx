'use client'

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  "full-name": z
    .string({ message: "Full Name is required" })
    .min(2, { message: "Full Name must be at least 2 characters long" }),
});

export default function Page() {
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
      formLabel="Multi Field Form"
      formKey="user-profile"
      handleSubmit={handleSave}
      formSchema={FormSchema}
      customDesign={{
        formClassName:'px-2 py-2 grid grid-cols-1 gap-4 pt-8 lg:grid-cols-1 sm:grid-cols-1 shadow-none'
      }}
      defaultValues={{
        'multi-field': [
          {
            'full-name': 'John Doe',
            "fieldType": "input",
            'label': 'Full Name',
            'order': 1,
          },
          {
            "fieldType": "select",
            'order': 2,
            'full-name': 'test.doe@example.com',
            'label': 'Email',
            "optionId": 1,
          },
          {
            "fieldType": "multi-select",
            'order': 3,
            'label': 'Email Address',
            'full-name': [
              { label: "ss.doe@example.com", value: "ss.doe@example.com" },
              { label: "ff.doe@example.com", value: "ff.doe@example.com" }
            ],
            "optionId": 2,
          },
          {
            "fieldType": "select-creatable",
            'order': 4,
            'label': 'Creatable Select',
            'full-name': 'existing-option-1',
            "optionId": 3,
          }
        ],
      }}
      fields={[
        {
          id: "multi-field",
          formType: "multi-field",
          name: "multi-field",
          label: "Multi Field",
          multiFieldConfig:  {
            showHeader: false,
            fields: {
              id: "fullName",
              formType: "input",
              name: "full-name",
              label: "Full Name",
              required: true,
              placeholder: "Enter your full name...",
            },
            fieldOptions: [
              {
                fieldType: "input",
                label: "Full Name",
              },
              {
                fieldType: "select",
                label: "Select Control",
                options: [
                  {
                    value: "john.doe@example.com",
                    label: "john.doe@example.com",
                  },
                  {
                    value: "test.doe@example.com",
                    label: "test.doe@example.com",
                  },
                ]
              }, {
                fieldType: "select",
                label: "Select Control 2",
                options: [
                  {
                    value: "ss.doe@example.com",
                    label: "ss.doe@example.com",
                  },
                  {
                    value: "ff.doe@example.com",
                    label: "ff.doe@example.com",
                  },
                ]
              },
              {
                // add the multi-select here
                fieldType: "multi-select",
                label: "Multi Select Control",
                options: [
                  {
                    value: "ss.doe@example.com",
                    label: "ss.doe@example.com",
                  },
                  {
                    value: "ff.doe@example.com",
                    label: "ff.doe@example.com",
                  },
                ]
              },
              {
                fieldType: "select-creatable",
                label: "Creatable Select Control",
                selectEnableCreate: true,
                selectOnCreateRecord: async (query: string) => {
                  // Simulate API call to create new record
                  return {
                    value: query.toLowerCase().replace(/\s+/g, '-'),
                    label: query,
                  };
                },
                selectOnCreateValidate: async (query: string) => {
                  // Simple validation - must be at least 2 characters
                  return {
                    valid: query.length >= 2,
                    message: query.length < 2 ? 'Must be at least 2 characters' : '',
                  };
                },
                options: [
                  {
                    value: "existing-option-1",
                    label: "Existing Option 1",
                  },
                  {
                    value: "existing-option-2",
                    label: "Existing Option 2",
                  },
                ]
              }
            ]
          },
        },
      ]}
    />
   )
}
