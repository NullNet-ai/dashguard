import { ColumnDef } from "@tanstack/react-table";
import { HTMLAttributes, HTMLInputTypeAttribute, ReactElement, ReactNode } from "react";
import { DropzoneOptions } from "react-dropzone";
import { UseFormReturn } from "react-hook-form";

import { TActionType } from "~/components/platform/Grid/types";
import { DateTimeGranularity, TFormSchema, TFormType, TSelectionType } from "./types";

interface OptionType {
  label: string;
  value: string;
};

interface IField {
  id: string;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  formType?: TFormType;
  creatable?: boolean;
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  dateGranularity?: DateTimeGranularity;
  dateMinDate?: Date;
  dateMaxDate?: Date;
  description?: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute | undefined;
  customRender?: JSX.Element;
  min?: number;
  max?: number;
  step?: number;
  radioOrientation?: "horizontal" | "vertical";
  sliderLabel?: (value: number | undefined) => ReactNode;
  sliderLabelPosition?: "top" | "bottom";
  fileDropzoneOptions?: DropzoneOptions;
  multiSelectMaxSelected?: number;
  multiSelectDelay?: number;
  multiSelectHidePlaceholderWhenSelected?: boolean;
  multiSelectTriggerSearchOnFocus?: boolean;
  multiSelectOnMaxSelected?: ((maxLimit: number) => void) | undefined;
  multiSelectLoadingIndicator?: ReactNode;
  multiSelectEmptyIndicator?: ReactNode;
  multiSelectHideClearAllButton?: boolean;
  richTextOutput?: "html" | "json" | "text";
  inputRightAddOns?: ReactNode | string;
  inputLeftAddOns?: ReactNode | string;
  isMultiSelectAlphabetical?: boolean;
  options?: {
    phoneNumberType?: TSelectionType;
    phoneEmailType?: TSelectionType;
    inputsType?: TSelectionType;
  };
}

interface ISelectOptions {
  value: string;
  label: string;
}

interface IRadioOptions {
  value: string;
  label: string;
}

interface ICheckboxOptions {
  value: string;
  label: string;
}

interface IHandleSubmit<T = Record<string, any>> {
  data: T;
  form?: UseFormReturn<Record<string, any>, any, undefined>;
  main_entity_id?: string;
  filter_entity?: string;
  action_type?: string
}

interface IOnFormListen
  extends UseFormReturn<Record<string, any>, any, undefined> {
  test?: any;
}

interface IButtonConfig {
  hideAccordions?: boolean;
  hideLockButton?: boolean;
  hideSaveButton?: boolean;
  hideDebugButton?: boolean;
}

interface IReturnOnSelectRecords {
  rows: any[];
  main_entity_id: string;
  filter_entity: string;
}

interface IUserFormField {
  error?: {
    label: { message: string };
    value: { message: string };
  }[];
}

interface IFilterGridConfig {
  selectedRecords?: any[];
  pluck?: string[];
  current?: number;
  limit?: number;
  filter_entity: string;
  main_entity_id: string;
  statusesIncluded?: string[];
  label?: string;
  gridColumns: ColumnDef<any>[];
  actionType: TActionType;
  renderComponentSelected?: (record: any) => JSX.Element;
  onSelectRecords?: ({
    rows,
    main_entity_id,
    filter_entity,
  }: IReturnOnSelectRecords) =>
    | Promise<IReturnOnSelectRecords>
    | IReturnOnSelectRecords;
  onRemoveSelectedRecords?: ({
    rows,
    main_entity_id,
    filter_entity,
  }: IReturnOnSelectRecords) =>
    | Promise<IReturnOnSelectRecords>
    | IReturnOnSelectRecords;
  onUpdateSelectedRecords?: ({
    rows,
    main_entity_id,
    filter_entity,
  }: IReturnOnSelectRecords) =>
    | Promise<IReturnOnSelectRecords>
    | IReturnOnSelectRecords;
}

interface IPropsForms {
  customDesign?: {
    formClassName?: string;
    headerClassName?: string;
  };
  formProps?: any;
  showCreateFormGrid?: boolean;
  enableFormRegisterToParent?: boolean;
  formLabel?: string;
  formKey: string;
  persistTimeout?: number;
  fields: IField[];
  buttonHeaderRender?: JSX.Element;
  defaultValues?: Record<string, any>;
  formSchema: TFormSchema;
  currencyInputOptions?: Record<string, OptionType[]>;
  selectOptions?: Record<string, ISelectOptions[]>;
  // multiSelectOptions?: Record<string, Option[]>;
  multiSelectOptions?: Record<string, any[]>; // TODO: remove
  // multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>;
  multiSelectOnSearch?: Record<string, (search: string) => Promise<any[]>>; // TODO: remove
  radioOptions?: Record<string, IRadioOptions[]>;
  checkboxOptions?: Record<string, ICheckboxOptions[]>;
  fetching?: boolean;
  defaultDisplay?: "expanded" | "collapsed";
  myParent?: "wizard" | "record";
  buttonConfig?: IButtonConfig;
  filterGridConfig?: IFilterGridConfig;
  enableAppendForm?: boolean;
  appendFormKey?: string;
  handleSubmitFormGrid?<T = any>(args: any): Promise<T[]>;
  handleSubmit?: (args: any) => Promise<any>;
  onFormChange?: (form: IOnFormListen) => void;
  onDataChange?: (data: Record<string, any>) => void;
  customRender?: (
    form: UseFormReturn<Record<string, any>, any, undefined>,
    options?: {
      appendButtonKey?: string;
    },
  // ) => ReactElement<typeof FormField> | ReactElement<typeof FormField>[]; // Strictly allows FormField or array of FormField components
  ) => ReactElement<any> | ReactElement<any>[]; // TODO: remove
}

export type {
  IButtonConfig, ICheckboxOptions, IField, IFilterGridConfig, IHandleSubmit,
  IOnFormListen, IPropsForms, IRadioOptions, IReturnOnSelectRecords, ISelectOptions, IUserFormField, OptionType
};
