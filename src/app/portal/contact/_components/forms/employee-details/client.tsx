"use client";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";

import { useToast } from "~/context/ToastProvider";
import { EmployeeDetailsSchema } from "~/server/zodSchema/contacts/employeeDetails";
import CustomEmployeeDetails from "./custom/EmployeeDetails";
import {
  createUpdateOrgContact,
  createUpdateSubOrg,
} from "./actions/createUpdateEmployeeDetails";
import { z } from "zod";
import { IFormProps } from "./types";

export default function EmployeeDetails({
  params,
  multiSelectOptions,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof EmployeeDetailsSchema>>) => {
    try {
      const _data = { contact_id: params?.id!, ...data };

      const [sub_org, org_contact] = await Promise.all([
        createUpdateSubOrg(_data),
        createUpdateOrgContact(_data),
      ]);

      if (!sub_org || !org_contact) {
        toast.error("Failed to submit Employee Details");
        return false;
      }

      toast.success("Employee Details submit sucessfully");
      return true;
    } catch (error) {
      toast.error("Failed to submit Employee Details");
    }
  };

  return (
    <>
      <FormBuilder
        myParent={params.shell_type}
        enableFormRegisterToParent
        defaultValues={defaultValues}
        formProps={params}
        formLabel="Employee Details"
        handleSubmit={handleSave}
        formKey="employee-details"
        formSchema={EmployeeDetailsSchema}
        multiSelectOptions={multiSelectOptions}
        fields={[]}
        customRender={(form) => (
          <CustomEmployeeDetails
            form={form}
            multiSelectOptions={multiSelectOptions}
          />
        )}
      />
    </>
  );
}
