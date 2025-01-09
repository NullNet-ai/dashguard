"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { Form } from "~/components/ui/form";

const FormSchema = z.object({
  draggable: z.array(
    z.object({
      "full-name": z
        .string({ message: "Full Name is required" })
        .min(2, { message: "Full Name must be at least 2 characters long" }),
    }),
  ),
});
export default function GroupTabView() {
  const form = useForm<z.infer<any>>({
    resolver: zodResolver(FormSchema), // is this where the validation relies?
    defaultValues: {
      "multi-field": [
        {
          "full-name": "John Doe",
          fieldType: "input",
        },
      ],
    },
    shouldFocusError: false,
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
        console.error("Profile update error", error);
        toast.error("Failed to update profile. Please try again.");
        reject(new Error("Profile update error"));
      }
    });
  };

  return (
    <div className='max-w-[700px]'>
      <Form {...form}>
        <FormModule
          form={form}
          formKey="user-profile"
          formSchema={FormSchema}
          fields={[
            {
              id: "multi-field",
              formType: "multi-field",
              name: "multi-field",
              label: "Multi Field",
              multiFieldConfig: {
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
                    ],
                  },
                  {
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
                    ],
                  },
                ],
              },
            },
          ]}
        />
      </Form>
    </div>
  );

  return (
    <FormBuilder
      enableFormRegisterToParent
      formLabel="User Profile Form"
      formKey="user-profile"
      handleSubmit={handleSave}
      formSchema={FormSchema}
      defaultValues={{
        "multi-field": [
          {
            "full-name": "John Doe",
            fieldType: "input",
          },
        ],
      }}
      fields={[
        {
          id: "multi-field",
          formType: "multi-field",
          name: "multi-field",
          label: "Multi Field",
          multiFieldConfig: {
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
                ],
              },
              {
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
                ],
              },
            ],
          },
        },
      ]}
    />
  );
}
