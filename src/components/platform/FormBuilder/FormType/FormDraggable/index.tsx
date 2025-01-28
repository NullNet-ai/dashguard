import React, {
  type ChangeEvent,
  type ChangeEventHandler,
  useEffect,
  useRef,
} from "react";
import { GripVerticalIcon, MinusIcon, PlusIcon } from "lucide-react";
// import { DevTool } from "@hookform/devtools";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  useFieldArray,
  type UseFormReturn,
} from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "~/components/ui/sortable";
import {
  type ICheckboxOptions,
  type IRadioOptions,
  type ISelectOptions,
  type IField,
} from "../../types/global/interfaces";
import { cn } from "~/lib/utils";
import AutosizeTextarea from "~/components/ui/autosize-textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import moment from "moment";
import { SmartDatetimeInput } from "~/components/ui/smart-datetime-picker";
import TimePicker from "~/components/ui/time-picker";
import { toast } from "sonner";
import { Alert, AlertContent, AlertTitle } from "~/components/ui/alert";
import { format, isValid, parse, set } from "date-fns";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  value?: string;
  formKey: string;
}

const FormDraggable = ({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) => {
  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: formRenderProps.field.name,
  });
  const { register } = form;
  const { error }: any = useFormField();
  const timePickerRef = useRef(null);
  const timePickerProps = fieldConfig.timePickerProps;
  const is24Hour = timePickerProps?.is24Hour;
  const timeFormat = is24Hour ? "HH:mm" : "hh:mm a";
  const parseTimeString = (timeStr: string): Date | null => {
    // Try parsing as 24-hour format first
    let date = parse(timeStr, "HH:mm", new Date());

    if (!isValid(date)) {
      // Try parsing as hour:minute without period
      date = parse(timeStr, "h:mm", new Date());

      if (isValid(date)) {
        // If no AM/PM specified, assume AM for 12-hour format
        if (!is24Hour) {
          date = set(date, { hours: date.getHours() % 12 });
        }
      } else {
        // Try parsing with AM/PM
        date = parse(timeStr, "h:mm a", new Date());
      }
    } else if (!is24Hour) {
      // Convert 24-hour time to 12-hour format
      date = set(date, { hours: date.getHours() % 12 });
    }

    return isValid(date) ? date : null;
  };

  const isDisabled = formRenderProps.field.disabled || fieldConfig.disabled;

  const isHidden = fieldConfig.hidden;
  const defValue = fieldConfig.draggableConfig?.reduce(
    (acc: Record<string, any>, config) => {
      if (config) {
        acc[`${config.fields.name}`] = "";
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  useEffect(() => {
    if (!fields?.length) {
      append(defValue);
    }
  }, []);
  if (isHidden) {
    return null;
  }

  const renderFormControl = (
    field: IField & {
      selectOptions?: ISelectOptions[];
      radioOptions?: IRadioOptions[];
      checkboxOptions?: ICheckboxOptions[];
    },
    index: number,
  ) => {
    const ISDisabled = isDisabled || field.disabled;

    const commonProps = {
      disabled: ISDisabled,
      className: `h-10 px-3 ${error && "border-destructive"}`,
    };

    switch (field.formType) {
      case "input":
        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}
            <FormControl>
              <Input
                {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                {...commonProps}
                readOnly={
                  (formRenderProps.field.disabled ||
                    field?.readonly ||
                    fieldConfig.readonly ||
                    field.readonly) ??
                  false
                }
                data-test-id={`${formKey}-inp-${fieldConfig.name}-${field.name}-${index + 1}`}
                placeholder={field.placeholder}
              />
            </FormControl>
            {error?.[index] && (
              <p
                id={field?.id}
                className={cn("py-1 text-md font-medium text-destructive")}
                data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
              >
                {error?.[index]?.[field.name]?.message}
              </p>
            )}

            {(error?.root?.message || error?.message) && (
              <FormMessage
                data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
              />
            )}
          </FormItem>
        );

      case "number-input":
        const handleNumberInputChange: ChangeEventHandler<HTMLInputElement> = (
          e,
        ) => {
          const value = e.target.value;
          // If the input is empty (user cleared it), set to undefined
          // Otherwise convert to number
          const finalValue = value === "" ? undefined : +value;

          form.setValue(
            `${fieldConfig.name}.${index}.${field.name}`,
            finalValue,
            {
              shouldDirty: true,
              shouldValidate: true,
              shouldTouch: true,
            },
          );
        };

        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}
            <FormControl>
              <Input
                {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                {...commonProps}
                placeholder={field.placeholder}
                data-test-id={`${formKey}-inp-${fieldConfig.name}`}
                readOnly={
                  (formRenderProps.field.disabled || fieldConfig?.readonly) ??
                  false
                }
                onChange={handleNumberInputChange}
                hasError={!!formRenderProps.fieldState.error}
                disabled={ISDisabled}
                type="number"
                inputMode="decimal"
                className={`no-spinner`}
                leftAddon={field.inputLeftAddOns}
                rightAddon={field.inputRightAddOns}
                autoComplete="off"
              />
            </FormControl>
            {error?.[index] && (
              <p
                id={field?.id}
                className={cn("py-1 text-md font-medium text-destructive")}
                data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
              >
                {error?.[index]?.[field.name]?.message}
              </p>
            )}

            {(error?.root?.message || error?.message) && (
              <FormMessage
                data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
              />
            )}
          </FormItem>
        );
      case "textarea":
        const handleTextAreaChange = (
          event: ChangeEvent<HTMLTextAreaElement>,
        ) => {
          form.setValue(
            `${fieldConfig.name}.${index}.${field.name}`,
            event.target.value,
            {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            },
          );
        };
        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}
            <FormControl>
              <AutosizeTextarea
                {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                onChange={handleTextAreaChange}
                maxHeight={field.textAreaMaxHeight}
                minHeight={field.textAreaMinHeight}
                showCharCount={field.textAreaShowCharCount}
                maxCharCount={field.textAreaMaxCharCount}
                lineWrapping={field.textAreaLineWrapping}
                maxLines={field.textAreaMaxLines}
                autoComplete="off"
                readOnly={
                  (formRenderProps.field.disabled ||
                    field?.readonly ||
                    fieldConfig.readonly) ??
                  false
                }
                placeholder={field?.placeholder}
                className={`${
                  formRenderProps.fieldState.error && "border-destructive"
                } !h-10`}
                disabled={ISDisabled}
                value={
                  form.getValues(
                    `${fieldConfig.name}.${index}.${field.name}`,
                  ) ?? ""
                }
              />
            </FormControl>
            {error?.[index] && (
              <p
                id={field?.id}
                className={cn("py-1 text-md font-medium text-destructive")}
                data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
              >
                {error?.[index]?.[field.name]?.message}
              </p>
            )}

            {(error?.root?.message || error?.message) && (
              <FormMessage
                data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
              />
            )}
          </FormItem>
        );
      case "select":
        const handleChange = (e: string) => {
          form.setValue(`${fieldConfig.name}.${index}.${field.name}`, e, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        };
        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}
            <FormControl>
              <Select
                {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                defaultValue={form.getValues(
                  `${fieldConfig.name}.${index}.${field.name}`,
                )}
                onValueChange={handleChange}
              >
                {fieldConfig.readonly || field.readonly ? (
                  <Input
                    {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                    {...commonProps}
                    readOnly
                  />
                ) : (
                  <SelectTrigger {...commonProps} disabled={ISDisabled}>
                    <SelectValue
                      placeholder={field.placeholder}
                      className="text-muted-foreground"
                    />
                  </SelectTrigger>
                )}

                {!ISDisabled && (
                  <SelectContent>
                    {Array.isArray(field.selectOptions) &&
                      field.selectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                )}
              </Select>
            </FormControl>
            {error?.[index] && (
              <p
                id={field?.id}
                className={cn("py-1 text-md font-medium text-destructive")}
                data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
              >
                {error?.[index]?.[field.name]?.message}
              </p>
            )}

            {(error?.root?.message || error?.message) && (
              <FormMessage
                data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
              />
            )}
          </FormItem>
        );
      case "radio":
        const handleRadioChange = (e: string) => {
          form.setValue(`${fieldConfig.name}.${index}.${field.name}`, e, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        };
        const { radioOptions } = field;
        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}
            <FormControl>
              <RadioGroup
                {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                data-test-id={`${formKey}-rdio-${fieldConfig.name}`}
                disabled={ISDisabled}
                onValueChange={handleRadioChange}
                value={formRenderProps.field.value[0]?.[field.name]}
                className={`${fieldConfig.radioOrientation === "vertical" && "flex-col"} flex gap-2`}
              >
                {radioOptions?.map((option, index) => (
                  <FormItem
                    key={index}
                    className="flex h-10 items-center gap-2 space-y-0"
                  >
                    <FormControl>
                      <RadioGroupItem
                        disabled={ISDisabled}
                        value={String(option.value)}
                        data-test-id={`${formKey}-opt-${index + 1}-${fieldConfig.name}`}
                        className={`${formRenderProps.fieldState.error && "border-destructive"}`}
                      />
                    </FormControl>
                    <FormLabel
                      className="font-normal"
                      data-test-id={`${formKey}-lbl-${option.label}-${fieldConfig.name}`}
                    >
                      {option.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            {error?.[index] && (
              <p
                id={field?.id}
                className={cn("py-1 text-md font-medium text-destructive")}
                data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
              >
                {error?.[index]?.[field.name]?.message}
              </p>
            )}

            {(error?.root?.message || error?.message) && (
              <FormMessage
                data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
              />
            )}
          </FormItem>
        );
      case "checkbox":
        const handleCheckboxChange = (
          field: ControllerRenderProps<Record<string, any>>,
          item?: ICheckboxOptions,
        ) => {
          if (!item) {
            // Single checkbox case - handle as boolean
            return (checked: boolean) => {
              field.onChange(checked);
            };
          }
          // Multiple checkboxes case - handle as array
          return (checked: boolean) => {
            const currentValue = field.value || [];
            if (Array.isArray(currentValue)) {
              return checked
                ? field.onChange([...currentValue, item.value])
                : field.onChange(
                    currentValue.filter((value: any) => value !== item.value),
                  );
            } else {
              return checked
                ? field.onChange([item.value])
                : field.onChange([]);
            }
          };
        };

        const isChecked = (
          field: ControllerRenderProps<Record<string, any>>,
          item?: ICheckboxOptions,
        ) => {
          if (!item) {
            // Single checkbox case - treat any truthy value as boolean true
            const value = field.value;
            return typeof value === "boolean" ? value : Boolean(value);
          }
          // Multiple checkboxes case
          const currentValue = field.value;
          if (Array.isArray(currentValue)) {
            return currentValue.includes(item.value);
          }
          return false;
        };

        const { checkboxOptions } = field;
        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}
            <FormControl>
              <div
                className={`${fieldConfig.checkboxOrientation === "vertical" && "flex-col"} flex gap-2`}
              >
                {(!checkboxOptions || (checkboxOptions?.length ?? 0) === 0) && (
                  <FormItem className="flex h-10 items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        {...register(
                          `${fieldConfig.name}.${index}.${field.name}`,
                        )}
                        className={`${formRenderProps.fieldState.error && "border-destructive"}`}
                        disabled={ISDisabled}
                        data-test-id={`${formKey}-chk-${fieldConfig?.name}`}
                        checked={isChecked(
                          field as unknown as ControllerRenderProps<
                            Record<string, any>
                          >,
                        )}
                        onCheckedChange={handleCheckboxChange(
                          field as unknown as ControllerRenderProps<
                            Record<string, any>
                          >,
                        )}
                      />
                    </FormControl>
                    {error?.[index] && (
                      <p
                        id={field?.id}
                        className={cn(
                          "py-1 text-md font-medium text-destructive",
                        )}
                        data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
                      >
                        {error?.[index]?.[field.name]?.message}
                      </p>
                    )}

                    {(error?.root?.message || error?.message) && (
                      <FormMessage
                        data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
                      />
                    )}
                  </FormItem>
                )}
                {checkboxOptions?.map((item, idx) => (
                  <FormItem
                    key={String(item.value)}
                    className="flex h-10 items-center gap-2 space-y-0"
                  >
                    <FormControl>
                      <Controller
                        name={`${fieldConfig.name}.${index}.${field.name}`}
                        control={form.control}
                        render={({ field }) => (
                          <Checkbox
                            className={`${formRenderProps.fieldState.error && "border-destructive"}`}
                            disabled={ISDisabled}
                            data-test-id={`${formKey}-chk-${fieldConfig?.name}-${idx + 1}`}
                            checked={isChecked(field, item)}
                            onCheckedChange={handleCheckboxChange(field, item)}
                          />
                        )}
                      />
                    </FormControl>
                    <FormLabel
                      className="font-normal disabled:opacity-100"
                      data-test-id={`${formKey}-chk-lbl-${fieldConfig.name}-${idx + 1}`}
                    >
                      {item.label}
                    </FormLabel>
                    {error?.[index] && (
                      <p
                        id={field?.id}
                        className={cn(
                          "py-1 text-md font-medium text-destructive",
                        )}
                        data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
                      >
                        {error?.[index]?.[field.name]?.message}
                      </p>
                    )}

                    {(error?.root?.message || error?.message) && (
                      <FormMessage
                        data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
                      />
                    )}
                  </FormItem>
                ))}
              </div>
            </FormControl>
            <FormMessage
              data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
            />
          </FormItem>
        );
      case "smart-date":
        const { dateGranularity, name: fieldName } = field;
        const name = `${fieldConfig.name}.${index}.${fieldName}`;
        const handleDateChange = (date: Date | null | string) => {
          if (date) {
            const formattedDate =
              dateGranularity === "year"
                ? moment(date).format("YYYY")
                : dateGranularity === "month"
                  ? moment(date).format("YYYY-MM")
                  : moment(date).format("MM/DD/YYYY");

            const formatted_date = formattedDate?.includes("Invalid date")
              ? date
              : formattedDate;

            form.setValue(`${name}`, formatted_date, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });

            form.setValue(`${name}_date`, moment(date).toDate(), {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          } else {
            form.setValue(`${name}`, "");
            form.setValue(`${name}_date`, null);
          }
        };

        const getValue = () => {
          const dateValue = form.getValues(`${name}_date`);
          if (dateValue) return dateValue;

          const stringValue = form.getValues(name);
          if (!stringValue) return null;

          const parsedDate = moment(stringValue);
          return parsedDate.isValid() ? parsedDate.toDate() : undefined;
        };
        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}

            <FormControl>
              <SmartDatetimeInput
                datePickerTestID={`${formKey}-dte-picker-${field.name}`}
                inputTestID={`${formKey}-inp-${field.name}`}
                value={getValue()}
                onValueChange={handleDateChange}
                placeholder={field.placeholder}
                dateTimePickerProps={field.dateTimePickerProps}
                inputProps={{
                  ...field.dateInputProps,
                }}
                disabled={ISDisabled}
                readOnly={
                  (formRenderProps.field.disabled || field?.readonly) ?? false
                }
              />
            </FormControl>
            {error?.[index] && (
              <p
                id={field?.id}
                className={cn("py-1 text-md font-medium text-destructive")}
                data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
              >
                {error?.[index]?.[field.name]?.message}
              </p>
            )}

            {(error?.root?.message || error?.message) && (
              <FormMessage
                data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
              />
            )}
          </FormItem>
        );
      case "time-picker":
        const handleTimeChange = (input: Date | string | undefined) => {
          if (input === "" || input === null || input === undefined) {
            form.clearErrors(formKey);
            return;
          }

          let date: Date | null;

          if (typeof input === "string") {
            date = parseTimeString(input);
          } else {
            date = input;
          }

          if (!date || !isValid(date)) {
            form.setError(formKey, {
              type: "pattern",
              message: `Invalid Time Format. Please use the correct format (${timeFormat}).`,
            });
            return;
          }

          const formattedTime = format(date, timeFormat);
          form.clearErrors(formKey);
          formRenderProps.field.onChange(formattedTime);
        };

        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}

            <FormControl>
              <div
                className={cn(
                  `!m-0 w-full rounded-md border border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-0`,
                  formRenderProps.fieldState.error && "border-destructive",
                  isDisabled && "bg-secondary text-muted-foreground",
                )}
              >
                <TimePicker
                  {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                  data-test-id={`${formKey}-timepicker-${fieldConfig.name}`}
                  is24Hour={timePickerProps?.is24Hour}
                  className={timePickerProps?.className}
                  ref={timePickerRef}
                  disabled={ISDisabled}
                  readonly={
                    (formRenderProps.field.disabled ||
                      field?.readonly ||
                      fieldConfig.readonly) ??
                    false
                  }
                  onChange={handleTimeChange}
                  value={
                    formRenderProps?.field?.value?.[0]?.[field.name]
                      ? parseTimeString(
                          form.getValues(
                            `${fieldConfig.name}.${index}.${field.name}`,
                          ) ?? "",
                        ) || undefined
                      : undefined
                  }
                />
              </div>
            </FormControl>
            {error?.[index] && (
              <p
                id={field?.id}
                className={cn("py-1 text-md font-medium text-destructive")}
                data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
              >
                {error?.[index]?.[field.name]?.message}
              </p>
            )}

            {(error?.root?.message || error?.message) && (
              <FormMessage
                data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
              />
            )}
          </FormItem>
        );
      default:
        return null;
    }
  };

  const fieldLength = fieldConfig?.draggableConfig?.length || 1;
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Sortable
          value={fields}
          onMove={({ activeIndex, overIndex }) => move(activeIndex, overIndex)}
        >
          <div className="flex w-full flex-col gap-2">
            {fields.map((field, index) => (
              <SortableItem key={field.id} value={field.id} asChild>
                <div
                  className={cn(
                    `relative grid items-end gap-2`,
                    fieldLength === 1
                      ? "grid-cols-[auto_1fr_auto]"
                      : fieldLength === 2
                        ? "grid-cols-[auto_1fr_1fr_auto]"
                        : "grid-cols-[auto_1fr_1fr_1fr_auto]",
                  )}
                >
                  <SortableDragHandle
                    variant="ghost"
                    size="icon"
                    className="mb-1 size-8 shrink-0 text-muted-foreground"
                  >
                    <GripVerticalIcon className="size-6" aria-hidden="true" />
                  </SortableDragHandle>
                  {fieldConfig.draggableConfig?.map((config) => (
                    <FormField
                      key={config?.fields?.id ?? index}
                      control={form.control}
                      name={`${formRenderProps.field.name}-${index}-${config?.fields?.name ?? ""}`}
                      render={() =>
                        config ? (
                          (renderFormControl(config.fields, index) ?? <div />)
                        ) : (
                          <div />
                        )
                      }
                    />
                  ))}
                  {!isDisabled && (
                    <Button
                      type="button"
                      variant="softDestructive"
                      size="icon"
                      className="mb-1 size-6 shrink-0 rounded-full"
                      onClick={() => {
                        if (isDisabled) return;
                        if (index === 0 && fields.length === 1) {
                          toast(
                            <Alert variant="error" dismissible>
                              <AlertTitle>Not Allowed</AlertTitle>
                              <AlertContent>
                                At least one group field is required.
                              </AlertContent>
                            </Alert>,
                          );
                          return;
                        }
                        remove(index);
                      }}
                    >
                      <MinusIcon
                        className="size-4 text-destructive"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}

                  {index === fields.length - 1 &&
                    (error?.root?.message || error?.message) && (
                      <FormMessage
                        className="absolute -bottom-8 right-8"
                        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
                      />
                    )}
                </div>
              </SortableItem>
            ))}
            {!isDisabled && (
              <Button
                className="mr-auto ms-7 gap-1 text-md text-primary hover:bg-transparent hover:opacity-70"
                variant="ghost"
                onClick={() => {
                  if (isDisabled) return;
                  append(defValue);
                }}
              >
                <PlusIcon className="size-5" aria-hidden="true" />
                Add {fieldConfig.label}
              </Button>
            )}
          </div>
        </Sortable>
      </FormControl>
      {/* <DevTool control={form.control} /> */}
    </FormItem>
  );
};

export default FormDraggable;
