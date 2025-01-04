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
import AutosizeTextarea from "~/components/ui/autosize-textarea";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
}

export default function FormTextArea({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) {
  const { register } = form;
  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <AutosizeTextarea
          {...register(fieldConfig.name)}
          data-test-id={`${formKey}-inp-${fieldConfig.name}`}
          icon={fieldConfig.textAreaIcon}
          maxHeight={fieldConfig.textAreaMaxHeight}
          minHeight={fieldConfig.textAreaMinHeight}
          showCharCount={fieldConfig.textAreaShowCharCount}
          maxCharCount={fieldConfig.textAreaMaxCharCount}
          lineWrapping={fieldConfig.textAreaLineWrapping}
          maxLines={fieldConfig.textAreaMaxLines}
          autoComplete="off"
          readOnly={
            (formRenderProps.field.disabled || fieldConfig?.readonly) ?? false
          }
          placeholder={fieldConfig?.placeholder}
          className={`${
            form.formState.errors[fieldConfig.name] && "border-destructive"
          } `}
          {...formRenderProps?.field}
          disabled={fieldConfig.disabled}
        />
      </FormControl>

      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}
