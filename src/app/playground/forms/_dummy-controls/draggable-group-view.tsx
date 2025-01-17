"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { Form } from "~/components/ui/form";

const FormSchema = z.object({
  draggable: z.array(
    z.object({
      "full-name": z
        .string({ message: "Full Name is required" })
        .min(2, { message: "Full Name must be at least 2 characters long" }),
      email: z
        .string({ message: "Email is required" })
        .email({ message: "Invalid email address" }),
    }),
  ),
});

export default function GroupTabView() {
  const form = useForm<z.infer<any>>({
    resolver: zodResolver(FormSchema), // is this where the validation relies?
    defaultValues: {
      draggable: [
        {
          "full-name": "John Doe",
          email: "",
        },
      ],
    },
    shouldFocusError: false,
  });

  return (
    <div>
      <Form {...form}>
        <FormModule
          form={form}
          formKey="user-profile"
          formSchema={FormSchema}
          fields={[
            {
              id: "draggable",
              formType: "draggable",
              name: "draggable",
              label: "Draggable",
              draggableConfig: [
                {
                  fields: {
                    id: "fullName",
                    formType: "input",
                    name: "full-name",
                    label: "Full Name",
                    required: true,
                    placeholder: "Enter your full name...",
                  },
                },
                {
                  fields: {
                    id: "email",
                    formType: "select",
                    name: "email",
                    label: "Email",
                    required: true,
                    placeholder: "Enter your email...",

                    selectOptions: [
                      {
                        value: "john.doe@example.com",
                        label: "john.doe@example.com",
                      },
                      {
                        value: "jane.doe@example.com",
                        label: "jane.doe@example.com",
                      },
                    ],
                  },
                },
              ],
            },
          ]}
        />
      </Form>
    </div>
  );
}
