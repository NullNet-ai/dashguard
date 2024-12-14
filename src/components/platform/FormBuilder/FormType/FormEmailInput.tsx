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
  });
  const { name } = formRenderProps.field;
  const isDisabled = formRenderProps?.field?.disabled || fieldConfig?.disabled;
  const isMultiple = fieldConfig?.options?.phoneEmailType === "multiple";
  const { register } = form;
  const values = form.watch(name);
  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-${fieldConfig.name}-lbl`}
      >
        {fieldConfig?.label}
      </FormLabel>

      {fields?.map((data, index) => {
        return (
          <div key={data?.id + index} className="mb-2 flex w-full flex-col">
            <FormControl>
              <>
                <div
                  className={`flex items-center focus-within:border-primary focus-within:outline-none focus-within:ring-1 focus-within:ring-ring ${fieldConfig.readonly ? "border-transparent read-only:opacity-50 disabled:opacity-100" : "border"} ${formRenderProps?.fieldState.error ? "border-destructive" : ""}`}
                >
                  <Input
                    {...register(`${fieldConfig.name}.${index}.email`)}
                    readOnly={fieldConfig?.readonly ?? false}
                    id={data?.id}
                    data-test-id={`${formKey}-${fieldConfig.name}-inp${isMultiple ? index + 1 : ""}`}
                    name={data?.id}
                    value={`${values[index]?.email || ""}`}
                    iconPlacement="left"
                    // hasError={!!formRenderProps.fieldState.error}
                    className={`rounded-none border-transparent focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-[-4]`}
                    disabled={isDisabled}
                    Icon={EnvelopeIcon}
                    placeholder={fieldConfig?.placeholder}
                    type={"email"}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                  />
                  {data?.is_primary && isMultiple && (
                    <Badge
                      variant={"outline"}
                      className={` bg-primary/10 py-1 font-normal text-primary mx-auto hover:bg-primary/10`}
                      data-test-id={`${formKey}-${fieldConfig.name}-prim-badge${isMultiple ? `-${index + 1}` : ""}`}
                    >
                      Primary
                    </Badge>
                  )}

                  {!data.is_primary && isMultiple && (
                    <Button
                      name={`${name}.${index}.setPrimaryButton`}
                      disabled={formRenderProps?.field?.disabled}
                      data-test-id={`${formKey}-${fieldConfig.name}-set-prim-btn-${index + 1}`}
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      className={`rounded-none ${formRenderProps?.fieldState.error ? "border-destructive" : ""}`}
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
                      data-test-id={`${formKey}-${fieldConfig.name}-rmv-btn-${index + 1}`}
                      className={`rounded-none hover:bg-transparent hover:text-primary-foreground ${formRenderProps?.fieldState.error ? "border-destructive" : ""}`}
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
                    data-test-id={`${formKey}-${fieldConfig.name}-err-msg-${index + 1}`}
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
          data-test-id={`${formKey}-${fieldConfig.name}-add-email-btn`}
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

      {error?.root?.message && (
        <FormMessage
          data-test-id={`${formKey}-${fieldConfig.name}-err-msg`}
        />
      )}
    </FormItem>
  );
}
