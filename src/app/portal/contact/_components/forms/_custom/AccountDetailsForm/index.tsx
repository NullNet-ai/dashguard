import { Fragment, useEffect, useState } from "react";
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
import { Badge } from "~/components/ui/badge";
import DeactivateConfirmationDialog, {
  IDialogContext,
} from "./DeactivateConfirmationDialog";
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
  role_id: string;
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
  const [dialogContext, setDialogContext] = useState<IDialogContext>();
  const { organization, user_role } = selectOptions || {};

  const updateAccountDetails = api.account.updateAccountDetails.useMutation();
  const validateAccountDetails =
    api.account.validateAccountDetails.useMutation();
  const updateAccountStatus = api.account.updateAccountStatus.useMutation();

  const {
    append,
  } = useFieldArray({
    control: form?.control,
    name: "accounts",
    keyName: "id",
  });

  const addAccount = () => {
    append({
      organization_id: "",
      role_id: "",
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
    try {
      const { disabled, ...rest } = field_values;
      const isValid = await form.trigger(`accounts.${index}`);
      if (!isValid) {
        return;
      } else {
        const { isValid, message } = await validateAccountDetails.mutateAsync({
          ...rest,
          contact_id: formProps?.id,
        });
        if (!isValid) {
          Object.entries(message).forEach(([key, value]) => {
            if (value) {
              form.setError(`accounts.${index}.${key}`, {
                type: "custom",
                message: value,
              });
            }
          });
          return;
        }
      }

      const response = await updateAccountDetails.mutateAsync({
        ...rest,
        contact_id: formProps?.id,
      });
      if (response) {
        toast.success("Account Details submit successfully");
        form.setValue(`accounts.${index}`, {...response, account_secret: "************", disabled: true});
        return response;
      }
      throw new Error("Failed to submit Account Details");
    } catch (error) {
      toast.error("Failed to submit Account Details");
    }
  };

  form.watch("accounts"); // Watch accounts array

  const handleUnlock = (index: string) => {
    form.setValue(`accounts.${index}.disabled`, false);
  };

  const handleCancel = (index: number, id: string) => {
    const formData = form.getValues();
    form.clearErrors(`accounts.${index}`);
    if (id) {
      const account = defaultValues?.accounts.find(
        (item: IAccounts) => item?.id === id,
      );
     
      form.setValue(`accounts.${index}`, {
        ...account,
        status: formData.accounts?.[index]?.status || account?.status,
      });
      return;
    }

    const updatedAccounts = [...formData.accounts];
    updatedAccounts.splice(index, 1);
    form.setValue("accounts", updatedAccounts);
  };

  const handleUpdateAccountStatus = async ({
    index,
    account_id,
    status,
  }: IDialogContext) => {
    try {
      const response = await updateAccountStatus.mutateAsync({
        account_id,
        status,
      });
      if (response) {
        toast.success(
          `Account successfully ${
            status === "Active" ? "Activated" : "Deactivated"
          }`,
        );
        form.setValue(`accounts.${index}.status`, status);

        return response;
      }
      throw new Error("Failed to submit Account Details");
    } catch (error) {
      toast.error(
        `Failed to ${
          status === "Active" ? "Activate" : "Deactivate"
        } the account`,
      );
    }
  };

  return (
    <>
      {form.getValues().accounts.map((field: any, index: any) => {
        const prefix = `accounts.${index}`;
        return (
          <Fragment key={index}>
            <BasicFormHostHeader
              key={`account_${index + 1}`}
              isLock={!!field?.disabled}
              label={
                <span className="text-md font-semibold leading-none tracking-tight">
                  {`Account ${index + 1}`}
                  {field?.status && field?.status === "Archived" && (
                    <Badge variant="destructive" className="ml-2">
                      Inactive
                    </Badge>
                  )}
                </span>
              }
              form={form}
              handleUnlock={() => handleUnlock(index)}
              handleCancel={() => handleCancel(index, field?.id)}
              handleSave={() => handleClickSave(index, field)}
              hideEllipseOptions={formProps?.shell_type !== "record"}
              ellipseOptions={[
                {
                  id: 1,
                  name:
                    field?.status === "Active"
                      ? "Deactivate Account"
                      : "Activate Account",
                  onClick: () => {
                    if (field?.status === "Active") {
                      setDialogContext({
                        open: true,
                        account_id: field?.id,
                        status:
                          field?.status === "Active" ? "Archived" : "Active",
                        index,
                      });
                      return;
                    }
                    handleUpdateAccountStatus({
                      index,
                      account_id: field?.id,
                      status:
                        field?.status === "Active" ? "Archived" : "Active",
                    });
                  },
                },
              ]}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FormModule
                formKey={"accounts"}
                form={form}
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
                    id: `${prefix}.role_id`,
                    name: `${prefix}.role_id`,
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
                    placeholder: field?.id ? "Change password": "",
                  },
                ]}
                subConfig={{
                  selectOptions: {
                    [`${prefix}.organization_id`]: organization || [],
                    [`${prefix}.role_id`]: user_role || [],
                  },
                }}
              />
            </div>
            {<Separator className="!my-4" dashed />}
          </Fragment>
        );
      })}
      <DeactivateConfirmationDialog
        context={dialogContext!}
        onChangeContext={(context: IDialogContext) => setDialogContext(context)}
        onConfirm={async (context: IDialogContext) => {
          await handleUpdateAccountStatus(context);
        }}
      />
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
    //                       id: `${prefix}.role_id`,
    //                       name: `${prefix}.role_id`,
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
    //                       [`${prefix}.role_id`]: user_role || [],
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
