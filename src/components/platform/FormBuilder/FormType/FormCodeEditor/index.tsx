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
import CodeEditor from '~/components/ui/code-editor';

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  formKey: string;
}

export default function FormCodeEditor({
  fieldConfig,
	formRenderProps,
  formKey,
	form
}: IProps) {
	const handleCodeChange = (value: string) => {
		formRenderProps.field.onChange(value);
		formRenderProps.field.onBlur();
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
				<CodeEditor 
          data-test-id={`${formKey}-inp-${fieldConfig.name}`}
					enable_editor_tools={fieldConfig.codeEditorProps?.enable_editor_tools}
					enable_auto_height={fieldConfig.codeEditorProps?.enable_auto_height}
					defaultTheme={fieldConfig.codeEditorProps?.defaultTheme}
					maxHeight={fieldConfig.codeEditorProps?.enable_auto_height ? fieldConfig.codeEditorProps?.maxHeight : undefined}
					minHeight={fieldConfig.codeEditorProps?.minHeight || ""}
					editorCode={formRenderProps.field.value}
          placeholder={fieldConfig?.placeholder}
					disabled={fieldConfig?.disabled || formRenderProps.field.disabled}
					readOnly={fieldConfig?.readonly}
          hasError={!!formRenderProps.fieldState.error}
					onCodeChange={handleCodeChange}
					{...formRenderProps.field}
				/>
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
        detail={fieldConfig.detail}
      />
    </FormItem>
  );
}
