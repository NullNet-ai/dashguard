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

  const handleChange = (date: Date | null) => {
    if (date) {
      const formattedDate =
        dateGranularity === "year"
          ? moment(date).format("YYYY")
          : dateGranularity === "month"
            ? moment(date).format("YYYY-MM")
            : moment(date).format("MM/DD/YYYY");
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
          value={formRenderProps.field.value}
          onValueChange={handleChange}
          placeholder={fieldConfig.placeholder}
          dateTimePickerProps={fieldConfig.dateTimePickerProps}
          inputProps={fieldConfig.dateInputProps}
          disabled={isDisable}
        />
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
      />
    </FormItem>
  );
}
