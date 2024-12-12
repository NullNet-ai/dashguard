export interface WizardLayoutProps {
  children?: React.ReactNode;
  [key: string]: any; // Allows additional props to be passed
}

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
    field_options?: IDropdown[];
  };
}
