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
import { type IField } from "../../types";
import moment from "moment";
import kebabCase from "lodash/kebabCase";



interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, Date>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey:string;
}


export default function FormDatePicker({
  fieldConfig,
  formRenderProps,
  form,
  formKey
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
  }
  return (
    <FormItem className="flex w-full flex-col" >
      <FormLabel required={required} data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "DateFormLabel")}>{label}</FormLabel>
      <FormControl>
        <DateTimePicker
          {...(form.register(fieldConfig?.name),
          {
            valueAsDate: true,
          })}
          data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "DateTimePicker")}
          name={(fieldConfig.name)}
          minDate={fieldConfig.dateMinDate}
          maxDate={fieldConfig.dateMaxDate}
          placeholder={fieldConfig.placeholder}
          disabled={isDisable}
          displayFormat={
            dateGranularity === "year"
              ? { hour24: "yyyy" }
              : dateGranularity === "month"
                ? { hour24: "MM/yyyy" }
                : { hour24: "MM/dd/yyyy" }
          }
          value={value && typeof value === "string" ? new Date(value) : value}
          onChange={handleChange}
          locale={undefined}
          weekStartsOn={undefined}
          showWeekNumber={undefined}
          showOutsideDays={undefined}
          granularity={dateGranularity ?? "day"}
        />
      </FormControl>
      <FormMessage data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "DateErrorMessage")}/>
    </FormItem>
  );
}
