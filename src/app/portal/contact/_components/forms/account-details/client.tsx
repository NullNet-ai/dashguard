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
      enableFormRegisterToParent={true}
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
      // fields={[
      //   {
      //     id: "organization",
      //     formType: "select",
      //     name: "organization",
      //     label: "Organization",
      //     required: true,
      //   },
      //   {
      //     id: "user_role",
      //     formType: "select",
      //     name: "user_role",
      //     label: "Role",
      //     required: true,
      //   },
      //   {
      //     id: "account_id",
      //     formType: "input",
      //     name: "account_id",
      //     label: "Username",
      //     required: true,
      //   },
      //   {
      //     id: "account_secret",
      //     formType: "password",
      //     name: "account_secret",
      //     label: "Password",
      //     required: true,
      //   },
      // ]}
    />
  );
}
