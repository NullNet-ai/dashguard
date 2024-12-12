"use client";
import React from "react";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { ReportSortingFormSchema } from "~/server/zodSchema/reports/reportSortingDetails";
import { IFormProps } from "../types";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { updateReportSorting } from "./Actions/updateReportSorting";
const ReportSortingForm = ({ params, defaultValues }: IFormProps) => {
  const toast = useToast();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ReportSortingFormSchema>>) => {
    try {
      const response = await updateReportSorting(data);
      toast.success("Record Filter submit successfully");
      return response;
    } catch (error) {
      toast.error("Failed to submit Record Filter");
    }
  };
  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Report Sorting"
      handleSubmit={handleSave}
      formKey="ReportSorting"
      formSchema={ReportSortingFormSchema}
      defaultValues={defaultValues}
      selectOptions={{
        order_direction: [
          { value: "ASCENDING", label: "ASCENDING" },
          { value: "DESCENDING", label: "DESCENDING" },
        ],
      }}
      fields={[
        {
          id: "order_key",
          formType: "input",
          name: "order_key",
          label: "Order Key",
          required: true,
        },
        {
          id: "order_direction",
          formType: "select",
          name: "order_direction",
          label: "Order Direction",
          required: true,
        },
      ]}
    />
  );
};

export default ReportSortingForm;
