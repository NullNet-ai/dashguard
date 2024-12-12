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
import { type IField } from "../type";
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
}
interface IUseFieldArrayEmail {
  fields: Record<keyof IEmailData, string>[];
  append: (data: IEmailData) => void;
  remove: (index: number) => void;
  replace: (data: IEmailData[]) => void;
}

interface IItem {
  is_primary: boolean;
  email: string;
}

interface DynamicFormValues {
  [key: string]: IItem[];
}
export default function FormEmailInput({
  fieldConfig,
  formRenderProps,
  form,
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
  }, []);
  const { name } = formRenderProps.field;
  const isDisabled = formRenderProps?.field?.disabled || fieldConfig?.disabled;
  const isMultiple = fieldConfig?.options?.phoneEmailType === "multiple";
  const { register } = form;
  const values = form.watch(name);
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required}>
        {fieldConfig?.label}
      </FormLabel>

      {fields?.map((data, index) => {
        return (
          <div key={data?.id + index} className="mb-2 flex w-full flex-col">
            <FormControl>
              <>
                <div
                  className={`flex items-center ${fieldConfig.readonly ? "border-transparent read-only:opacity-50 disabled:opacity-100" : "border"}`}
                >
                  <Input
                    {...register(`${fieldConfig.name}.${index}.email`)}
                    readOnly={fieldConfig?.readonly ?? false}
                    id={data?.id}
                    data-test-id={fieldConfig.name + (index + 1)}
                    name={data?.id}
                    iconPlacement="left"
                    hasError={!!formRenderProps.fieldState.error}
                    className="rounded-none border-transparent"
                    disabled={isDisabled}
                    Icon={EnvelopeIcon}
                    placeholder={fieldConfig?.placeholder}
                    type={"email"}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                  />
                  {data?.is_primary && isMultiple && (
                    <Badge
                      variant={"outline"}
                      className="mr-1 bg-primary/10 py-1 font-normal text-primary"
                      data-test-id={
                        fieldConfig.name + `_is_primary_badge_${index + 1}`
                      }
                    >
                      Primary
                    </Badge>
                  )}

                  {!data.is_primary && isMultiple && (
                    <Button
                      name={`${name}.${index}.isPrimaryButton`}
                      disabled={formRenderProps?.field?.disabled}
                      data-test-id={
                        fieldConfig.name + `_is_primary_button_${index + 1}`
                      }
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      className="rounded-none border-l"
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
                      disabled={formRenderProps?.field?.disabled}
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      data-test-id={
                        fieldConfig.name + `_remove_button_${index + 1}`
                      }
                      className="rounded-none border-l"
                      onClick={() => {
                        const _values = form.getValues(fieldConfig.name);
                        handleRemoveEmail(index, _values);
                      }}
                    >
                      <TrashIcon className="h-5 w-5 text-[#93a3b7]" />
                    </Button>
                  )}
                </div>
                {error?.[index] && (
                  <p
                    id={data?.id}
                    className={cn("py-1 text-sm font-medium text-destructive")}
                  >
                    {error?.[index]?.email?.message}
                  </p>
                )}
              </>
            </FormControl>
          </div>
        );
      })}

      {!isDisabled && isMultiple && (
        <Button
          name={`${name}.AddEmailButton`}
          data-test-id={fieldConfig.name + "AddEmailButton"}
          disabled={formRenderProps?.field?.disabled}
          type="button"
          Icon={PlusIcon}
          variant={"link"}
          iconPlacement="left"
          onClick={handleAddEmail}
          className="mt-2"
        >
          Add Email
        </Button>
      )}

      {error?.root?.message && <FormMessage />}
    </FormItem>
  );
}
