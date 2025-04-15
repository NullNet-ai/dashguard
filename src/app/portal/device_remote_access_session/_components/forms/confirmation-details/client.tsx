"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { type IFormProps } from "../types";
import { useContext, useEffect, useState } from "react";
import { WizardContext } from "~/components/platform/Wizard/Provider";
import { LinkIcon } from "@heroicons/react/20/solid";

const FormSchema = z.object({
  tags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export default function ConfirmationDetails({
  params,
  defaultValues,
}: IFormProps) {
  const { actions } = useContext(WizardContext)
    const [loading, setLoading] = useState(true)
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    actions?.setCallback({
      customizeWizardButtonSave: {
        label: 'Connect',
        icon: <LinkIcon className="h-6 w-4 text-secondary" />,
        disableDropdown: true,
        disabled: loading,
        dropdownOptions: [],
      },
    })
  }, [])

  return (
    <FormBuilder
      defaultValues={defaultValues}
      formSchema={FormSchema}
      myParent={params.shell_type}
      formProps={params}
      handleSubmit={handleSave}
      formLabel="Tags"
      formKey="Tags"
      fields={[
        // {
        //   id: "tags",
        //   formType: "multi-select",
        //   name: "tags",
        //   label: "Tags",
        // },
      ]}
    />
  );
}
