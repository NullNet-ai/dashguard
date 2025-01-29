"use client";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { ContactAccountDetailsSchema } from "~/server/zodSchema/contact/accountDetails";
import AccountDetailsForm from "../_custom/AccountDetailsForm";
import { type IFormProps } from "../types";

export default function AccountDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent={false}
      formProps={params}
      formLabel="Account Details"
      formKey="account_details"
      formSchema={ContactAccountDetailsSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      enableAppendForm={true}
      appendFormKey="add_account"
      customRender={(form, options) => (
        <AccountDetailsForm
          form={form}
          selectOptions={selectOptions}
          formSchema={ContactAccountDetailsSchema}
          appendFormKey={options?.appendButtonKey || ""}
          formProps={params}
          defaultValues={defaultValues}
        />
      )}
      features={{
        enableFormHostViewActions: false,
      }}
      customDesign={{
        formClassName: "lg:grid-cols-1 sm:grid-cols-1 ",
      }}
      buttonConfig={{
        hideLockButton: true,
      }}
      fields={[]}
    />
  );
}
