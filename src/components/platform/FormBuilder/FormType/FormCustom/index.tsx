import {
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

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
}

export default function FormCustom({ fieldConfig }: IProps) {
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>{fieldConfig?.customRender}</FormControl>
      <FormMessage />
    </FormItem>
  );
}
