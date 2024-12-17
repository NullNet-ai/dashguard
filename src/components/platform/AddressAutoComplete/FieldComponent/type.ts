import {
  ControllerFieldState,
  ControllerRenderProps,
  UseFormReturn,
} from "react-hook-form";

export interface IFieldComponentProps {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
}
