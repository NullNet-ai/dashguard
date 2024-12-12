import React, { useEffect } from "react";
import {
  useFieldArray,
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField } from "../type";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { CheckIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { type ParsedCountry, PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { Badge } from "~/components/ui/badge";
import { ulid } from "ulid";
import { toast } from "sonner";
import kebabCase from "lodash/kebabCase";
import capitalize from "lodash/capitalize";
import { isPhoneValid } from "../utils/phoneValidator";
;
import { DevTool } from "@hookform/devtools";

interface IPhoneData {
  id?: string;
  raw_phone_number: string;
  iso_code: string;
  country_code: string;
  is_primary: boolean;
}

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
}

export default function FormPhoneInput({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) {
  interface IUseFieldArrayPhone {
    fields: Record<keyof IPhoneData, string>[];
    append: (data: IPhoneData) => void;
    remove: (index: number) => void;
    replace: (data: IPhoneData[]) => void;
  }
  const { error }: any = useFormField();
  const { name } = formRenderProps.field;
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: name,
  }) as IUseFieldArrayPhone;

  const handleAddPhoneNumber = () => {
    append({
      id: ulid(),
      raw_phone_number: "1",
      iso_code: "",
      country_code: "",
      is_primary: false,
    });
  };

  const handlePhoneNumberChange = (
    index: number,
    value: string,
    meta?: {
      country: ParsedCountry;
      inputValue: string;
    },
  ) => {
    // Don't validate empty values
    if (value === "1" || value === "+1") return;

    const isValid = isPhoneValid(value, meta?.country?.iso2 || "US");

    if (!isValid) {
      form.setValue(
        `${name}.${index}.raw_phone_number`,
        value.replace("+", ""),
        {
          shouldDirty: true,
        },
      );
    } else {
      form.clearErrors(`${name}.${index}.raw_phone_number`);
      form.setValue(
        `${name}.${index}.raw_phone_number`,
        value.replace("+", ""),
        {
          shouldDirty: true,
        },
      );
    }

    if (meta?.country) {
      form.setValue(`${name}.${index}.iso_code`, meta.country.iso2, {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue(`${name}.${index}.country_code`, meta.country.dialCode, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };
  const handleRemovePhoneNumber = (
    index: number,
    value: Record<string, any>,
  ) => {
    const phone_input = value;

    // Check if the item at the specified index is primary
    if (phone_input && phone_input[index]?.is_primary && isMultiple) {
      toast.error("Primary phone cannot be removed");
      return;
    }

    remove(index);
  };

  useEffect(() => {
    if (!fields?.length) {
      append({
        id: ulid(),
        raw_phone_number: "1",
        iso_code: "",
        country_code: "",
        is_primary: true,
      });
    }
  }, []);

  const isDisabled = formRenderProps?.field?.disabled;
  const isMultiple = fieldConfig?.options?.phoneNumberType === "multiple";
  const values = form.watch(name);

  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "PhoneFormLabel")}
      >
        {fieldConfig?.label}
      </FormLabel>
      {fields?.map((field, index) => (
        <div
          key={field.id}
          className={`mb-2 flex w-full flex-col ${isDisabled ? "transparent" : "inherit"}`}
        >
          <FormControl>
            <>
              <div className={`flex items-center border ${error && "border-destructive"}`}>
                <PhoneInput
                  // {...register(`${name}.${index}.raw_phone_number`)}
                  data-test-id={kebabCase(
                    formKey + " "+ (fieldConfig.name) + "PhoneInput" + (index + 1),
                  )}
                  inputProps={{
                    // @ts-expect-error - Not able to pass data-test-id on types
                    "data-test-id": kebabCase(
                      formKey + " "+ (fieldConfig.name) + (index + 1) + "PhoneInput",
                    ),
                  }}
                  countrySelectorStyleProps={{
                    // @ts-expect-error - Not able to pass data-test-id on types
                    "data-test-id": kebabCase(
                      formKey +
                        (fieldConfig.name) +
                        (index + 1) +
                        "PhoneCountrySelector",
                    ),
                    buttonStyle: {
                      padding: "1.2rem",
                      paddingInline: "0.5rem",
                      backgroundColor: "inherit",
                      borderColor: "transparent",
                      borderRightColor: `${error ?"#DC2626" : "inherit"}`,
                      colorScheme: "normal",
                    },
                  }}
                  defaultCountry="us"
                  disabled={isDisabled || fieldConfig?.disabled}
                  value={`+${values[index]?.raw_phone_number || ""}`}
                  onChange={(phone, meta) =>
                    handlePhoneNumberChange(index, phone, meta)
                  }
                  className={cn(
                    "mr-[1px] w-[90%] rounded-md !border-input bg-transparent text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-transparent disabled:opacity-100",
                    `${isDisabled && "pointer-events-none border-transparent opacity-100"}`,
                  )}
                  inputStyle={{
                    width: "100%",
                    backgroundColor: "transparent",
                    color: "inherit",
                    borderColor: `transparent`,
                    padding: "1.2rem",
                    opacity: "inherit",
                  }}
                  inputClassName="ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-transparent text-foreground disabled:opacity-100"
                />
                {field.is_primary && isMultiple && (
                  <Badge
                    variant={"outline"}
                    className="mr-1 bg-primary/10 py-1 font-normal text-primary"
                    data-test-id={kebabCase(
                      formKey + " "+ (fieldConfig.name) + `IsPrimaryBadge${index + 1}`,
                    )}
                  >
                    Primary
                  </Badge>
                )}

                {!field.is_primary && isMultiple && (
                  <Button
                    name={`${name}.${index}.isPrimaryButton`}
                    disabled={isDisabled}
                    data-test-id={kebabCase(
                      formKey +
                        (fieldConfig.name) +
                        `isPrimaryButton${index + 1}`,
                    )}
                    type="button"
                    variant={"ghost"}
                    size={"icon"}
                    className="rounded-none border-l"
                    onClick={() => {
                      const updatedFields = values.map(
                        (f: IPhoneData, i: number) => ({
                          ...f,
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
                    name={`${name}.${index}.RemovePhoneNumberButton`}
                    disabled={isDisabled}
                    type="button"
                    variant={"ghost"}
                    size={"icon"}
                    data-test-id={kebabCase(
                      formKey + " "+ (fieldConfig.name) + `RemoveButton${index + 1}`,
                    )}
                    className="rounded-none border-l"
                    onClick={() => {
                      const _values = form.getValues((fieldConfig.name));
                      handleRemovePhoneNumber(index, _values);
                    }}
                  >
                    <TrashIcon className="h-5 w-5 text-[#93a3b7]" />
                  </Button>
                )}
              </div>
              {error?.[index] && (
                <p
                  id={field.id}
                  className={cn("py-1 text-md font-medium text-destructive")}
                  data-test-id={kebabCase(
                    formKey +
                      (fieldConfig.name) +
                      `PhoneErrorMessage${index + 1}`,
                  )}
                >
                  {error[index]?.raw_phone_number?.message}
                </p>
              )}
            </>
          </FormControl>
        </div>
      ))}

      {!isDisabled && isMultiple && (
        <Button
          name={`${name}.AddPhoneNumberButton`}
          data-test-id={kebabCase(
            formKey + " "+ (fieldConfig.name) + "AddPhoneButton",
          )}
          type="button"
          Icon={PlusIcon}
          variant={"link"}
          iconPlacement="left"
          onClick={handleAddPhoneNumber}
          className="mt-2"
        >
          Add Phone Number
        </Button>
      )}
      {(error?.root?.message || error?.message) && (
        <FormMessage
          data-test-id={kebabCase(
            formKey + " "+ (fieldConfig.name) + "PhoneErrorMessage",
          )}
        />
      )}

      {/* <DevTool control={form.control} /> */}
    </FormItem>
  );
}
