import {
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
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  formKey: string;
  value?: string;
}

export default function FormNumber({
  fieldConfig,
  formRenderProps,
  icon,
  form,
  formKey
}: IProps) {
  const isDisabled = formRenderProps.field.disabled || fieldConfig.disabled;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // If the input is empty (user cleared it), set to undefined
    // Otherwise convert to number
    const finalValue = value === "" ? undefined : +value;

    form.setValue(fieldConfig?.name, finalValue, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  }

  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required} data-test-id={`${formKey}-${fieldConfig.name}-lbl`}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Input
          {...formRenderProps.field}
          data-test-id={`${formKey}-${fieldConfig.name}-inp`}
          readOnly={fieldConfig?.readonly ?? false}
          type="number"
          inputMode="decimal"
          className={`no-spinner ${isDisabled && "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100"}`}
          disabled={isDisabled}
          placeholder={fieldConfig?.placeholder}
          iconPlacement="left"
          Icon={icon}
          hasError={!!formRenderProps.fieldState.error}
          onChange={handleChange}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-${fieldConfig.name}-err-msg`}/>
    </FormItem>
  );
}
