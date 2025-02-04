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
import { Switch } from "~/components/ui/switch";
import { type IField } from "../../types/global/interfaces";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  formKey: string;
}

export default function FormSwitch({
  fieldConfig,
  formRenderProps,
  formKey,
  form,
}: IProps) {
  const { register } = form;
  const { field } = formRenderProps;
  const { switchConfig } = fieldConfig;
  const isDisabled =
    fieldConfig.readonly ||
    fieldConfig.disabled ||
    formRenderProps.field.disabled;
  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Switch
          {...register(fieldConfig.name)}
          {...field}
          value={field.value ?? false}
          checked={field.value  as unknown as boolean}
          onCheckedChange={field.onChange}
          disabled={isDisabled}
          aria-readonly={fieldConfig.readonly}
          leftIcon={switchConfig?.leftIcon}
          rightIcon={switchConfig?.rightIcon}
          iconClassName={switchConfig?.iconClassName}
          leftLabel={switchConfig?.leftLabel}
          leftLabelClassName={switchConfig?.leftLabelClassName}
          rightLabel={switchConfig?.rightLabel}
          rightLabelClassName={switchConfig?.rightLabelClassName}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}
