import { CheckIcon, EnvelopeIcon, TrashIcon } from "@heroicons/react/20/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import {
  useFieldArray,
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { type IFieldFilterActions, type IField } from "../../types";
import { ulid } from "ulid";
import { useToast } from "~/context/ToastProvider";

export interface IEmailData {
  id?: string;
  email: string;
  is_primary: boolean;
}

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  fieldFilterActions?: IFieldFilterActions;
  formKey: string;
}
interface IUseFieldArrayEmail {
  fields: Record<keyof IEmailData, string>[];
  append: (data: IEmailData) => void;
  remove: (index: number) => void;
  replace: (data: IEmailData[]) => void;
}

export default function FormEmailInput({
  fieldConfig,
  formRenderProps,
  form,
  fieldFilterActions,
  formKey,
}: IProps) {
  const { error }: any = useFormField();
  const toast = useToast();
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: formRenderProps.field.name,
  }) as IUseFieldArrayEmail;

  const handleAddEmail = () => {
    append({ id: ulid(), email: "", is_primary: false });
  };

  const handleEmailChange = (index: number, value: string) => {
    form.setValue(`${formRenderProps.field?.name}.${index}.email`, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };
  const handleRemoveEmail = (index: number, value: IEmailData[]) => {
    const email_input = value;

    // Check if the item at the specified index is primary
    if (email_input && email_input[index]?.is_primary && isMultiple) {
      toast.error("Primary email cannot be removed");
      return;
    }

    remove(index);
  };

  useEffect(() => {
    if (!fields?.length) {
      append({ id: ulid(), email: "", is_primary: true });
    }
  },[]);
  const { name } = formRenderProps.field;
  const isDisabled = formRenderProps?.field?.disabled;
  const isMultiple = fieldConfig?.options?.phoneEmailType === "multiple";
  const values = form.watch(name);
  const { handleSearch, ...restFieldFilterActions } = fieldFilterActions ?? {};

  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>

      {fields?.map((data, index) => {
        return (
          <div key={data?.id + index} className="mb-2 flex w-full flex-col">
            <FormControl>
              <>
                <div
                  className={`flex items-center rounded-md border focus-within:border-primary focus-within:outline-none focus-within:ring-1 h-[36px] focus-within:ring-ring  ${error?.[index] ? "border-destructive" : ""} ${fieldConfig.disabled ? "bg-secondary" : ""}`}
                >
                  <Input
                    // {...register(`${fieldConfig.name}.${index}.email`)}
                    readOnly={
                      (formRenderProps.field.disabled ||
                        fieldConfig?.readonly) ??
                      false
                    }
                    value={`${values?.[index]?.email || ""}`}
                    disabled={fieldConfig.disabled}
                    containerClassName="!mt-0"
                    id={data?.id}
                    data-test-id={`${formKey}-inp-${index + 1}-${fieldConfig.name}`}
                    name={data?.id}
                    defaultValue={`${values?.[index]?.email || ""}`}
                    iconPlacement="left"
                    className={`rounded-none border-0 !py-0 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-[-4] disabled:border-0 h-[30px] ps-8`}
                    Icon={EnvelopeIcon}
                    placeholder={fieldConfig?.placeholder}
                    type={"email"}
                    onChange={(e) => {
                      handleEmailChange(index, e.target.value);
                      if (handleSearch) {
                        handleSearch(e.target.value);
                      }
                    }}
                    {...(restFieldFilterActions ?? {})}
                  />
                  {data?.is_primary && isMultiple && (
                    <Badge
                      variant={"outline"}
                      className={`mx-auto bg-primary/10 py-1 font-normal text-primary hover:bg-primary/10`}
                      data-test-id={`${formKey}-prim-badge-${index + 1}-${fieldConfig.name}`}
                    >
                      Primary
                    </Badge>
                  )}

                  {!data.is_primary && isMultiple && (
                    <Button
                      name={`${name}.${index}.setPrimaryButton`}
                      disabled={
                        (formRenderProps.field.disabled ||
                          fieldConfig?.readonly) ??
                        false
                      }
                      data-test-id={`${formKey}-set-prim-btn-${index + 1}-${fieldConfig.name}`}
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      className={`rounded-none disabled:opacity-100 ${formRenderProps?.fieldState.error ? "border-destructive" : ""}`}
                      onClick={() => {
                        const updatedFields = values.map(
                          (field: IEmailData, i: number) => ({
                            ...field,
                            is_primary: i === index,
                          }),
                        );
                        replace(updatedFields);
                      }}
                    >
                      <CheckIcon className="h-5 w-5 text-[#a3a3a3]" />
                    </Button>
                  )}

                  {isMultiple && (
                    <Button
                      name={`${name}.${index}.RemoveEmailInputButton`}
                      disabled={
                        (formRenderProps.field.disabled ||
                          fieldConfig?.readonly) ??
                        false
                      }
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      data-test-id={`${formKey}-rmv-btn-${index + 1}-${fieldConfig.name}`}
                      className={`rounded-none hover:bg-transparent hover:text-primary-foreground disabled:opacity-100 ${formRenderProps?.fieldState.error ? "border-destructive" : ""}`}
                      onClick={() => {
                        const _values = form.getValues(fieldConfig.name);
                        handleRemoveEmail(index, _values);
                      }}
                    >
                      <TrashIcon className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                {error?.[index] && (
                  <p
                    id={data?.id}
                    className={cn("py-1 text-md font-medium text-destructive")}
                    data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}`}
                  >
                    {error?.[index]?.email?.message}
                  </p>
                )}
              </>
            </FormControl>
          </div>
        );
      })}

      {/* <DevTool control={form.control} /> */}

      {!isDisabled && isMultiple && (
        <Button
          name={`${name}.AddEmailButton`}
          data-test-id={`${formKey}-add-email-btn-${fieldConfig.name}`}
          disabled={
            (formRenderProps.field.disabled || fieldConfig?.readonly) ?? false
          }
          type="button"
          Icon={PlusIcon}
          variant={"link"}
          iconPlacement="left"
          onClick={handleAddEmail}
          className="mt-2 disabled:opacity-100"
        >
          Add Email
        </Button>
      )}

      {(error?.root?.message || error?.message) && (
        <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
      )}
    </FormItem>
  );
}
