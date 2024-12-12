import { type TFormType } from "~/components/platform/FormBuilder/type";

export interface IDropdown {
  label: string;
  value: string;
}

export interface IFormProps<T = Record<string, any>> {
  params: {
    id: string;
    shell_type: "wizard" | "record";
    entity?: string;
    navigation?: Record<string, any>;
  };
  config?: T;
  defaultValues?: any;
}

export interface IOption {
  value: string;
  label: string;
}

export interface IField {
  id: string;
  formType: TFormType;
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  options?: Record<string, any>;
}
