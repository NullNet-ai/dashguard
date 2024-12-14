export interface IFormProps<T = Record<string, any>> {
  params: {
    id: string;
    shell_type: "wizard" | "record";
    entity?: string;
    navigate?: {
      wizard_step?: string;
      record_tab?: string;
    };
    pluck_fields?: string[];
    pluck_object?: Record<string, string[]>;

  };
  config?: T;
  defaultValues?: any;
  selectOptions?: Record<string, any>;
  selectedRecords?: any;
  grid_data?: {
    items: Record<string, any>[];
    totalCount: number;
  }
}
