export interface IFormProps<T = Record<string, any>> {
  params: {
    id: string;
    shell_type: "wizard" | "record";
    entity?: string;
    navigate?: {
      wizard_step?: string;
      record_tab?: string;
    };
  };
  config?: T;
  defaultValues?: any;
  selectOptions?: Record<string, any>;
  multiSelectOptions?: Record<string, any>;
  contact_files?: any;
}
