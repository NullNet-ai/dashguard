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
  multiSelectOptions?: Record<string, any>;
  selectOptions?: Record<string, any>;
  // selectOptions?: {
  //   benefit_id?: IDropdown[];
  //   employment_type_id?: IDropdown[];
  //   position_type_id?: IDropdown[];
  //   requirement_type?: IDropdown[];
  //   company_options?: Record<string, any>[];
  // };
}

export interface IDropdown {
  label: string;
  value: string;
}
