import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IFieldFilterActions, type IField } from "../../types";
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
  fieldFilterActions?: IFieldFilterActions
}

export default function FormNumber({
  fieldConfig,
  formRenderProps,
  icon,
  form,
  fieldFilterActions,
  formKey
}: IProps) {
  const isDisabled = formRenderProps.field.disabled;
  const { handleSearch, ...restFieldFilterActions } = fieldFilterActions ?? {};

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
    if(handleSearch){
      handleSearch(e.target.value);
    }
  }

  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required} data-test-id={`${formKey}-lbl-${fieldConfig.name}`}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Input
          {...formRenderProps.field}
          data-test-id={`${formKey}-inp-${fieldConfig.name}`}
           readOnly={(formRenderProps.field.disabled || fieldConfig?.readonly) ?? false}
          disabled={fieldConfig.disabled}
          type="number"
          inputMode="decimal"
          className={`no-spinner`}
          placeholder={fieldConfig?.placeholder}
          iconPlacement="left"
          Icon={icon}
          hasError={!!formRenderProps.fieldState.error}
          onChange={handleChange}
          leftAddon={fieldConfig.inputLeftAddOns}
          rightAddon={fieldConfig.inputRightAddOns}
          autoComplete="off"
          {...(restFieldFilterActions ?? {})}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}/>
    </FormItem>
  );
}

