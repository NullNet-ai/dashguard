import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { DateTimePicker } from "~/components/ui/date-picker";
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
}

export default function FormSmartDate({
  fieldConfig,
  formRenderProps,
  form,
}: IProps) {
  const {
    label,
    disabled: isFieldDisable,
    dateGranularity,
    name,
    required,
  } = fieldConfig;
  const { disabled, value } = formRenderProps.field;
  const isDisable = isFieldDisable || disabled;

  const handleChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate =
        dateGranularity === "year"
          ? moment(date).format("YYYY")
          : dateGranularity === "month"
            ? moment(date).format("YYYY-MM")
            : moment(date).format("YYYY-MM-DD");
      form.setValue(name, formattedDate, {
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
      <FormLabel required={required}>{label}</FormLabel>
      <FormControl>
        <SmartDatetimeInput
          datePickerTestID={fieldConfig.name + "DatePicker"}
          inputTestID={fieldConfig.name + "DateInput"}
          value={formRenderProps.field.value}
          onValueChange={handleChange}
          placeholder="e.g. Tomorrow"
          dateTimePickerProps={fieldConfig.dateTimePickerProps}
          inputProps={fieldConfig.dateInputProps}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
