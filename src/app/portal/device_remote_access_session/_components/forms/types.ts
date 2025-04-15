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
  row?:any
  props?: Record<string, any>
  entity?: string;
  record_data?: Record<string, any>
  config?: T;
  defaultValues?: any;
  selectOptions?: any;
}
