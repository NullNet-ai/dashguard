"use client";
import React from "react";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { ReportFiltersFormSchema } from "~/server/zodSchema/report_filters/reportFilterDetails";
import { IFormProps } from "../types";
import { useToast } from "~/context/ToastProvider";
import ReportFilter from "./Custom/ReportFilter";
import { updateReportFilters } from "./Actions/updateReportFilters";

const ReportFiltersForm = ({ params, defaultValues }: IFormProps) => {
  const toast = useToast();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ReportFiltersFormSchema>>) => {
    try {
      const response = await updateReportFilters(data);
      toast.success("Record Filter submit successfully");

      return response;
    } catch (error) {
      toast.error("Failed to submit Record Filter");
    }
  };
  return (
    <FormBuilder
      customDesign={{
        formClassName: "w-full",
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Report Filters"
      handleSubmit={handleSave}
      formKey="ReportFilters"
      formSchema={ReportFiltersFormSchema}
      defaultValues={defaultValues}
      enableAppendForm={true}
      appendFormKey="form-filters1"
      customRender={(form, options) => {
        return (
          <ReportFilter
            form={form}
            identifier={params.id}
            options={{
              ...options,
              appendFormKey: options?.appendButtonKey || "",
            }}
            selectOptions={{
              operator: [
                { value: "equal", label: "Equal" },
                { value: "not_equal", label: "Not Equal" },
                { value: "contains", label: "Contains" },
              ],
            }}
          />
        );
      }}
      fields={[]}
    />
  );
};

export default ReportFiltersForm;
