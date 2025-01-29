import { IDropdown } from "~/app/portal/contact/_components/forms/category-details/types";

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
  defaultValues: Record<string, any>;
  config?: T;
  selectOptions?: any;
}
