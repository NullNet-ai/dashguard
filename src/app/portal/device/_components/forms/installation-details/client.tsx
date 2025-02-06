"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import CustomInstallationDetails from "../_custom/InstallationDetails";

const FormSchema = z.object({
  server_url: z.string().optional(),
});

export default function InstallationDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
    } catch (error) {
      toast.error("Failed to submit Installation Details");
    }
  };

  return (
    <FormBuilder
      defaultValues={defaultValues}
      customDesign={{
        formClassName: "!grid-cols-1",
      }}
      formSchema={FormSchema}
      myParent={params.shell_type}
      formProps={params}
      handleSubmit={handleSave}
      formLabel="Firewall"
      formKey="firewall"
      fields={[]}
      customRender={(form) => <CustomInstallationDetails form={form} />}
    />
  );
}
