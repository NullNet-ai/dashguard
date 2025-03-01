import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type IField } from "../../types";
import moment from "moment";
import { SmartDatetimeInput } from "~/components/ui/smart-datetime-picker";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, Date>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
}

export default function FormSmartDate({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) {
  const {
    label,
    disabled: isFieldDisable,
    dateGranularity,
    name,
    required,
  } = fieldConfig;

  const handleChange = (date: Date | null | string) => {
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
    <FormItem className="flex w-full flex-col">
      <FormLabel
        required={required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {label}
      </FormLabel>
      <FormControl>
        <SmartDatetimeInput
          datePickerTestID={`${formKey}-dte-picker-${fieldConfig.name}`}
          inputTestID={`${formKey}-inp-${fieldConfig.name}`}
          value={getValue()}
          onValueChange={handleChange}
          placeholder={fieldConfig.placeholder}
          dateTimePickerProps={fieldConfig.dateTimePickerProps}
          inputProps={fieldConfig.dateInputProps}
          disabled={isFieldDisable}
          readOnly={
            (formRenderProps.field.disabled || fieldConfig?.readonly) ?? false
          }
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}