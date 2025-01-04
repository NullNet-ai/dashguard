import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField } from "../../types";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Slider } from "~/components/ui/slider";
import { useState } from "react";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: number[];
  formKey: string;
}

export default function FormSlider({
  fieldConfig,
  formRenderProps,
  form,
  value,
  formKey,
}: IProps) {
  const { field } = formRenderProps;
  const {
    name,
    sliderLabel,
    sliderLabelPosition,
    min,
    max,
    step,
    required,
    label,
  } = fieldConfig;
  const { disabled } = field;
  const isDisabled = disabled || fieldConfig.disabled;
  const [values, setValues] = useState(value ?? [0, 100]);
  function handleChanges(value: number[]) {
    setValues(value);
    form.setValue(name, value);
  }

  return (
    <FormItem>
      <FormLabel
        required={required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {label}
      </FormLabel>
      <FormControl>
        <Slider
          {...form.register(name)}
          data-test-id={`${formKey}-sld-${fieldConfig.name}`}
          className={`${
            isDisabled &&
            "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100"
          }`}
          disabled={isDisabled}
          label={
            sliderLabel ??
            ((value) => (
              <span
                className="text-md text-muted-foreground"
                data-test-id={`${formKey}-val-lbl-${fieldConfig.name}`}
              >
                {value}
              </span>
            ))
          }
          labelPosition={sliderLabelPosition}
          value={values}
          onValueChange={handleChanges}
          min={min}
          max={max}
          step={step}
        />
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
      />
    </FormItem>
  );
}
