import { Fragment, useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";

import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { type ISelectOptions } from "~/components/platform/FormBuilder/types";
import { useWizard } from "~/components/platform/Wizard/Provider";
import { Badge } from "~/components/ui/badge";
import BasicFormHostHeader from "~/components/ui/basic-form-host-header";
import { Separator } from "~/components/ui/separator";
import { useEventEmitter } from "~/context/EventEmitterProvider";
import { useToast } from "~/context/ToastProvider";
import { useEventListener } from "~/hooks/useEventListener";
import { api } from "~/trpc/react";

import DeactivateConfirmationDialog, {
  type IDialogContext,
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
  defaultValues: Record<string, any>;
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
  const { actions } = useWizard();
  const eventEmitter = useEventEmitter();
  const [dialogContext, setDialogContext] = useState<IDialogContext>();
  const { organization, user_role } = selectOptions || {};

  const updateAccountDetails = api.account.updateAccountDetails.useMutation();
  const validateAccountDetails =
    api.account.validateAccountDetails.useMutation();
  const updateAccountStatus = api.account.updateAccountStatus.useMutation();

  const { append } = useFieldArray({
    control: form.control,
    name: "accounts",
    keyName: "id",
  });

  const addAccount = () => {
    append({
      organization_id: "",
      role_id: "",
      account_id: "",
      account_secret: "",
      contact_id: formProps?.id,
      disabled: false,
    });
  };

  useEventListener({
    eventKey: appendFormKey,
    listener: addAccount,
  });

  const handleClickSave = async (index: number, field_values: any) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-unused-vars
      const { disabled: _disabled, ...rest } = field_values;
      const isValid = await form.trigger(`accounts.${index}`);
      if (!isValid) {
        return;
      }
      const { isValid: valid, message } =
        await validateAccountDetails.mutateAsync({
          ...rest,
          contact_id: formProps?.id,
        });
      if (!valid) {
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

      const response = await updateAccountDetails.mutateAsync({
        ...rest,
        contact_id: formProps?.id,
      });
      actions?.setFormSave({});
      if (response) {
        toast.success("Account Details submit successfully");
        form.setValue(`accounts.${index}`, {
          ...response,
          account_secret: "************",
          disabled: true,
        });
        eventEmitter.emit(`formStatus:account_details`, {
          status: "done",
          form_key: "action",
        });
        return response;
      }
      throw new Error("Failed to submit Account Details");
    } catch (error) {
      toast.error("Failed to submit Account Details");
    }
  };

  // Watch accounts array
  form.watch("accounts");

  const handleUnlock = (index: string) => {
    form.setValue(`accounts.${index}.disabled`, false);
  };

  const handleCancel = (index: number, id: string) => {
    const formData = form.getValues();
    form.clearErrors(`accounts.${index}`);
    if (id) {
      const account = defaultValues.accounts.find(
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
              form={form}
              handleCancel={() => handleCancel(index, field?.id)}
              handleSave={() => handleClickSave(index, field)}
              handleUnlock={() => handleUnlock(index)}
              hideEllipseOptions={formProps?.shell_type !== "record"}
              isLock={!!field?.disabled}
              key={`account_${index + 1}`}
              label={
                <span className="text-md font-semibold leading-none tracking-tight">
                  {`Account ${index + 1}`}
                  {field?.status && field?.status === "Archived" && (
                    <Badge className="ml-2" variant="destructive">
                      Inactive
                    </Badge>
                  )}
                </span>
              }
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FormModule
                fields={[
                  {
                    id: `${prefix}.organization_id`,
                    name: `${prefix}.organization_id`,
                    formType: "select",
                    label: "Organization",
                    required: true,
                    disabled: !!field?.disabled,
                    readonly: field?.id && formProps?.shell_type === "record",
                    isCustomFormField: true,
                  },
                  {
                    id: `${prefix}.role_id`,
                    name: `${prefix}.role_id`,
                    formType: "select",
                    label: "Role",
                    required: true,
                    disabled: !!field?.disabled,
                    isCustomFormField: true,
                  },
                  {
                    id: `${prefix}.account_id`,
                    name: `${prefix}.account_id`,
                    formType: "input",
                    label: "Username",
                    required: true,
                    disabled: !!field?.disabled,
                    isCustomFormField: true,
                  },
                  {
                    id: `${prefix}.account_secret`,
                    name: `${prefix}.account_secret`,
                    formType: "password",
                    label: "Password",
                    required: true,
                    disabled: !!field?.disabled,
                    placeholder: field?.id ? "Change password" : "",
                    isCustomFormField: true,
                    showPasswordStrengthBar: true,
                    hasComplexValidation: true,
                  },
                ]}
                form={form}
                formKey="accounts"
                formSchema={formSchema}
                subConfig={{
                  selectOptions: {
                    [`${prefix}.organization_id`]: organization || [],
                    [`${prefix}.role_id`]: user_role || [],
                  },
                }}
              />
            </div>
            <Separator className="!my-4" dashed={true} />
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
  );
}
