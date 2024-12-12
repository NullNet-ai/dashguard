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
import { Textarea } from "~/components/ui/textarea";
import { UserIcon } from "lucide-react";
import AutosizeTextarea from "~/components/ui/autosize-textarea";
import kebabCase from "lodash/kebabCase";
import capitalize from "lodash/capitalize";
;
interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey:string
}
export default function FormTextArea({
  fieldConfig,
  formRenderProps,
  form,
  formKey
}: IProps) {
  const { register } = form;
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required} data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "TextAreaFormLabel")}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <AutosizeTextarea
          {...register((fieldConfig.name))}
          data-test-id={kebabCase(formKey+ (fieldConfig.name) + "TextAreaInput")}
          icon={UserIcon}
          maxHeight={fieldConfig.textAreaMaxHeight}
          minHeight={fieldConfig.textAreaMinHeight}
          showCharCount={fieldConfig.textAreaShowCharCount}
          maxCharCount={fieldConfig.textAreaMaxCharCount}
          lineWrapping={fieldConfig.textAreaLineWrapping}
          maxLines={fieldConfig.textAreaMaxLines}
          autoComplete="off"
          readOnly={fieldConfig?.readonly ?? false}
          disabled={formRenderProps.field.disabled || fieldConfig.disabled}
          placeholder={fieldConfig?.placeholder}
          className={`${form.formState.errors[(fieldConfig.name)] && "border-destructive"}`}
          {...formRenderProps?.field}
        />
      </FormControl>

      <FormMessage data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "TextAreaErrorMessage")}/>
    </FormItem>
  );
}
