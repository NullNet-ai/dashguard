import { Fragment, useEffect } from "react";
import { FieldError, useFieldArray, UseFormReturn } from "react-hook-form";
import { ulid } from "ulid";
import { useToast } from "~/context/ToastProvider";
import { useEventListener } from "~/hooks/useEventListener";
import { FormField, FormItem } from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { ISelectOptions } from "~/components/platform/FormBuilder/types";
import BasicFormHostHeader from "~/components/ui/basic-form-host-header";
import { api } from "~/trpc/react";
import FormInput from "~/components/platform/FormBuilder/FormType/FormInput";
import { ContactAccountDetailsSchema } from "~/server/zodSchema/contact/accountDetails";
interface IAccountDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  selectOptions?: {
    organization?: ISelectOptions[];
    user_role?: ISelectOptions[];
  };
  appendFormKey?: string;
  formSchema: any;
  formProps?: {
    id: string;
    shell_type: string;
  };
  defaultValues?: Record<string, any>;
}

interface IAccounts {
  id?: string;
  organization_id: string;
  user_role_id: string;
  account_id: string;
  account_secret: string;
}

export default function AccountDetailsForm({
  form,
  selectOptions,
  formSchema,
  appendFormKey,
  formProps,
  defaultValues,
}: IAccountDetails) {
  const toast = useToast();
  const { organization, user_role } = selectOptions || {};
  console.log(
    "%c 🐃: selectOptions ",
    "font-size:16px;background-color:#22b253;color:white;",
    selectOptions,
  );
  const updateAccountDetails = api.account.updateAccountDetails.useMutation();

  const {
    fields,
    append,
    remove: handleRemove,
  } = useFieldArray({
    control: form?.control,
    name: "accounts",
    keyName: "id",
  });

  const addAccount = () => {
    append({
      organization_id: "",
      user_role_id: "",
      account_id: "",
      account_secret: "",
      disabled: false,
    });
  };

  useEventListener({
    eventKey: appendFormKey,
    listener: addAccount,
  });

  const handleClickSave = async (index: number, field_values: any) => {
    // field_values contains the key:value pair of the form section
    // must remove disabled before passing on a trpc request or any other request

    try {
      const { disabled, ...rest } = field_values;
      console.log(
        "%c 🥉: handleSave -> rest ",
        "font-size:16px;background-color:#b5d7ca;color:black;",
        rest,
      );
      const isValid = await form.trigger(`accounts.${index}`);
      console.log(
        "%c 🙎‍♀️: handleClickSave -> isValid ",
        "font-size:16px;background-color:#630847;color:white;",
        isValid,
      );

      if (!isValid) {
        return;
      }
      const response = await updateAccountDetails.mutateAsync({
        ...rest,
        contact_id: formProps?.id,
      });
      if (response) {
        toast.success("Account Details submit successfully");
        form.setValue(`accounts.${index}.disabled`, true);

        return response;
      }
      throw new Error("Failed to submit Account Details");
    } catch (error) {
      console.log(
        "%c 🇭🇰: handleClickSave -> error ",
        "font-size:16px;background-color:#c968db;color:white;",
        error,
      );
      toast.error("Failed to submit Account Details");
    }
  };

  form.watch("accounts"); // Watch accounts array

  const handleUnlock = () => {
    form.setValue("accounts.0.disabled", false);
  };

  const handleCancel = (index: number, account_id: string) => {
    const formData = form.getValues();
    if (account_id) {
      const account = defaultValues?.accounts.find(
        (item: IAccounts) => item?.id === account_id,
      );
      console.log("%c 🏼: handleCancel -> account ", "font-size:16px;background-color:#d5bcea;color:black;", account)
      const updatedAccounts = [...formData.accounts];
      updatedAccounts[index] = account;
      console.log("%c 🍗: handleCancel -> updatedAccounts ", "font-size:16px;background-color:#55e6d4;color:black;", updatedAccounts)
      form.setValue("accounts", updatedAccounts);
      return;
    }

    const updatedAccounts = [...formData.accounts];
    updatedAccounts.splice(index, 1);
    form.setValue("accounts", updatedAccounts);
  };

  return (
    <>
      {form.getValues().accounts.map((field: any, index: any) => {
        const prefix = `accounts.${index}`;
        return (
          <Fragment key={index}>
            {!!form?.formState?.disabled && (
              <BasicFormHostHeader
                key={`account_${index + 1}`}
                isLock={!!field?.disabled}
                label={`Account ${index + 1}`}
                form={form}
                handleUnlock={handleUnlock}
                handleCancel={() => handleCancel(index, field?.id)}
                handleSave={() => handleClickSave(index, field)}
                ellipseOptions={[
                  {
                    id: 1,
                    name: "Deactivate",
                    onClick: () => handleRemove(index),
                  },
                ]}
              />
            )}
            {/* <FormInput
                  fieldConfig={{
                    id: "account_id",
                    name: `account_id`,
                    formType: "input",
                    label: "Username",
                    required: true,
                    disabled: !!field?.disabled,
                  }}
                  form={form}
                  formKey="accounts"
                  formRenderProps={formRender}

                  /> */}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FormModule
                formKey="accounts"
                formSchema={formSchema}
                fields={[
                  {
                    id: `${prefix}.organization_id`,
                    name: `${prefix}.organization_id`,
                    formType: "select",
                    label: "Organization",
                    required: true,
                    disabled: !!field?.disabled,
                  },
                  {
                    id: `${prefix}.user_role_id`,
                    name: `${prefix}.user_role_id`,
                    formType: "select",
                    label: "Role",
                    required: true,
                    disabled: !!field?.disabled,
                  },
                  {
                    id: `${prefix}.account_id`,
                    name: `${prefix}.account_id`,
                    formType: "input",
                    label: "Username",
                    required: true,
                    disabled: !!field?.disabled,
                  },
                  {
                    id: `${prefix}.account_secret`,
                    name: `${prefix}.account_secret`,
                    formType: "password",
                    label: "Password",
                    required: true,
                    disabled: !!field?.disabled,
                  },
                ]}
                form={form}
                subConfig={{
                  selectOptions: {
                    [`${prefix}.organization_id`]: organization || [],
                    [`${prefix}.user_role_id`]: user_role || [],
                  },
                }}
              />
            </div>
            {<Separator className="!my-4" dashed />}
          </Fragment>
        );
      })}
    </>
    // <FormField
    //   name="accounts"
    //   control={form.control}
    //   render={(data) => {
    //     console.log(
    //       "%c 🏊‍♂️: data ",
    //       "font-size:16px;background-color:#e2a089;color:white;",
    //       data,
    //     );

    //     return (
    //       <FormItem>
    //         {form.getValues().accounts.map((field: any, index: any) => {
    //           const prefix = `accounts.${index}`;
    //           return (
    //             <Fragment key={index}>
    //               {!form?.formState?.disabled && (
    //                 <BasicFormHostHeader
    //                   key={`account_${index + 1}`}
    //                   isLock={!!field?.disabled}
    //                   label={`Account ${index + 1}`}
    //                   form={form}
    //                   handleUnlock={handleUnlock}
    //                   handleCancel={() => handleCancel(index)}
    //                   handleSave={() => handleClickSave(index, field)}
    //                   ellipseOptions={[
    //                     {
    //                       id: 1,
    //                       name: "Deactivate",
    //                       onClick: () => handleRemove(index),
    //                     },
    //                   ]}
    //                 />
    //               )}
    //               {/* <FormInput
    //               fieldConfig={{
    //                 id: "account_id",
    //                 name: `account_id`,
    //                 formType: "input",
    //                 label: "Username",
    //                 required: true,
    //                 disabled: !!field?.disabled,
    //               }}
    //               form={form}
    //               formKey="accounts"
    //               formRenderProps={formRender}

    //               /> */}

    //               <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    //                 <FormModule
    //                   formKey="accounts"
    //                   formSchema={formSchema}
    //                   fields={[
    //                     {
    //                       id: `${prefix}.organization_id`,
    //                       name: `${prefix}.organization_id`,
    //                       formType: "select",
    //                       label: "Organization",
    //                       required: true,
    //                       disabled: !!field?.disabled,
    //                     },
    //                     {
    //                       id: `${prefix}.user_role_id`,
    //                       name: `${prefix}.user_role_id`,
    //                       formType: "select",
    //                       label: "Role",
    //                       required: true,
    //                       disabled: !!field?.disabled,
    //                     },
    //                     {
    //                       id: `${prefix}.account_id`,
    //                       name: `${prefix}.account_id`,
    //                       formType: "input",
    //                       label: "Username",
    //                       required: true,
    //                       disabled: !!field?.disabled,
    //                     },
    //                     {
    //                       id: `${prefix}.account_secret`,
    //                       name: `${prefix}.account_secret`,
    //                       formType: "password",
    //                       label: "Password",
    //                       required: true,
    //                       disabled: !!field?.disabled,
    //                     },
    //                   ]}
    //                   form={form}
    //                   subConfig={{
    //                     selectOptions: {
    //                       [`${prefix}.organization_id`]: organization || [],
    //                       [`${prefix}.user_role_id`]: user_role || [],
    //                     },
    //                   }}
    //                 />
    //               </div>
    //               {<Separator className="!my-4" dashed />}
    //             </Fragment>
    //           );
    //         })}
    //       </FormItem>
    //     );
    //   }}
    // />
  );
}
