"use client";
import React from "react";
import GroupTab, { type GroupTabType } from "~/components/ui/group-tab";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { z } from "zod";

const FormSchema = z.object({
  "full-name": z
    .string({ message: "Full Name is required" })
    .min(2, { message: "Full Name must be at least 2 characters long" }),
});

export default function GroupTabWithMultiField({ form, options }: any) {

  const isdisabled = form.formState.disabled

  const [selected, setSelected] = React.useState<GroupTabType | null>(null);
  const [data, setData] = React.useState<GroupTabType[]>([
    {
      id: crypto.randomUUID(),
      name: "Group 1",
      content: (
        <FormModule
          formSchema={FormSchema}
          form={form}
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
          formKey={"test"}
        />
      ),
    },
    {
      id: crypto.randomUUID(),
      name: "Group 2",
      content: <div>Testing</div>,
    },
  ]);

  return (
    <GroupTab
      selected={selected}
      //@ts-ignore
      tabs={data}
      disabled={isdisabled}
      onValueChange={setData}
      onTabSelect={setSelected}
      onClickAddTab={() => {
        setData([
          ...data,
          {
            id: crypto.randomUUID(),
            name: `Group ${data.length + 1}`,
            content: <div>Content of tab #: {data?.length + 1}</div>,
          },
        ]);
      }}
    />
  );
}
