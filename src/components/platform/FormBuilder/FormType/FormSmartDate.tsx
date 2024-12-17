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
import { type IField } from "../type";
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
  const { disabled } = formRenderProps.field;
  const isDisable = isFieldDisable || disabled;

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

      form.setValue(name, formatted_date, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      form.setValue(name, "");
    }
  };
  return (
    <FormItem className="flex w-full flex-col">
      <FormLabel
        required={required}
        data-test-id={`${formKey}-${fieldConfig.name}-lbl`}
      >
        {label}
      </FormLabel>
      <FormControl>
        <SmartDatetimeInput
          datePickerTestID={`${formKey}-${fieldConfig.name}-dte-picker`}
          inputTestID={`${formKey}-${fieldConfig.name}-input`}
          value={formRenderProps.field.value}
          onValueChange={handleChange}
          placeholder={fieldConfig.placeholder}
          dateTimePickerProps={fieldConfig.dateTimePickerProps}
          inputProps={fieldConfig.dateInputProps}
          disabled={isDisable}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-${fieldConfig.name}-err-msg`} />
    </FormItem>
  );
}
