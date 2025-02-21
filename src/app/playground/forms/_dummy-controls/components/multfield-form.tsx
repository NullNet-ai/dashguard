"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { Form } from "~/components/ui/form";


export default function MultiFieldForms(props: any) {
    
    const {form, formSchema } = props

    console.log("form, formSchema", form, formSchema)

  const handleSave = async (values: { data: z.infer<any> }) => {
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
    <div className='w-full'>
      <Form {...form}>
        <FormModule
          form={form}
          formKey="user-profile"
          formSchema={formSchema}
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
}
