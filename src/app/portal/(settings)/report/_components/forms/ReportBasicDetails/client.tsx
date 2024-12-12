"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { entityFormSchema } from "~/server/zodSchema/reports/entityFormSchema";
import { IFormProps } from "../types";

export default function ReportBasicDetailsForm({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateReportBasicDetails =
    api.report.updateReportBasicDetails.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof entityFormSchema>>) => {
    try {
      const reportId = params.id!;

      const response = await updateReportBasicDetails.mutateAsync({
        ...data,
        id: reportId,
      });

      toast.success("Report Details submitted sucessfully");
      return response;
    } catch (error) {
      toast.error("Failed to submit Report Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Report's Entity and Name"
      handleSubmit={handleSave}
      formKey="ReportEntityName"
      formSchema={entityFormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "entity_name",
          formType: "input",
          name: "entity_name",
          label: "Entity Name",
          required: true,
        },
        {
          id: "report_name",
          formType: "input",
          name: "report_name",
          label: "Report Name",
          required: true,
        },
      ]}
    />
  );
}
