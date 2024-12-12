import { TFormType } from "~/components/platform/FormBuilder/type";

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
  selectOptions?: {
    proficiency_options?: IDropdown[];
    years_of_experience_options?: IDropdown[];
    country_id?: IDropdown[];
    degree_level_id?: IDropdown[];
    notice_period?: IDropdown[];
    user_role_id?: IDropdown[];
    "address.country"?: IDropdown[];
    "address.city"?: IDropdown[];
    department?: IDropdown[];
  };
  contact_files?: Record<string, string>[];
  multiSelectOptions?: Record<string, any>;
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
