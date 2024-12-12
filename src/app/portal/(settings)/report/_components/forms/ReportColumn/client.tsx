"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { columnFormSchema } from "~/server/zodSchema/reports/columnFormSchema";
import { IFormProps } from "../types";

export default function ReportColumnsForm({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateReportColumns = api.report.updateReportColumns.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof columnFormSchema>>) => {
    try {
      const reportId = params.id!;

      const columns = data.columns.map((column) => column?.value);

      const response = await updateReportColumns.mutateAsync({
        columns,
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
      formLabel="Report Columns"
      handleSubmit={handleSave}
      formKey="ReportEntityName"
      formSchema={columnFormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "columns",
          formType: "multi-select",
          name: "columns",
          label: "Column Fields",
          required: true,
        },
      ]}
    />
  );
}
