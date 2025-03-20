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
} from "~/components/ui/form";
import CodeEditor from '~/components/ui/code-editor';
import { DevTool } from '@hookform/devtools';
import Banner from '~/components/ui/banner';

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

export default function FormBanner({
  fieldConfig,
  formKey,
	form
}: IProps) {
  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required} 
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
				<Banner 
          data-test-id={`${formKey}-inp-${fieldConfig.name}`}
					contentAlign={fieldConfig.bannerProps?.contentAlign}
					position={fieldConfig.bannerProps?.position}
					hideable={fieldConfig.bannerProps?.hideable}
					sticky={fieldConfig.bannerProps?.sticky}
					className={fieldConfig?.className}
					maxWidth={fieldConfig.bannerProps?.maxWidth}
					content={fieldConfig.bannerProps?.content}
					actions={fieldConfig.bannerProps?.actions}
				/>
      </FormControl>
      {/* <DevTool  control={form.control} /> */}
    </FormItem>
  );
}
