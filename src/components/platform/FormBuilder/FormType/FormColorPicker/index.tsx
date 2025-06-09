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
import { ColorPicker } from "~/components/ui/color-picker";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  fieldFilterActions?: IFieldFilterActions;
  formKey: string;
}

export default function FormColorPicker({
  fieldConfig,
  formRenderProps,
  formKey,
  form
}: IProps) {
  const isDisabled = form?.formState.disabled;
  const isHidden = fieldConfig.hidden;

  if (isHidden) {
    return null;
  }

  const handleColorChange = (data: any) => {
		formRenderProps.field.onChange(data.value);
		formRenderProps.field.onBlur();
    form.setValue(fieldConfig.name, data.value);
	};

  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <ColorPicker
           {...fieldConfig.colorPickerConfig}
           onColorChange={handleColorChange}
           disabled={isDisabled}
        />
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
        detail={fieldConfig.detail}
      />
    </FormItem>
  );
}
