import { type ColumnDef } from "@tanstack/react-table";
import {
  type HTMLAttributes,
  type HTMLInputTypeAttribute,
  type ReactElement,
  type ReactNode,
} from "react";
import { type DropzoneOptions } from "react-dropzone";
import { type UseFormReturn } from "react-hook-form";

import { type TActionType } from "~/components/platform/Grid/types";
import {
  type DateTimeGranularity,
  type TFormSchema,
  type TFormType,
  type TSelectionType,
} from "./types";
import { type DateTimeLocalInputProps } from "~/components/ui/smart-datetime-picker";

interface OptionType {
  label: string;
  value: string;
}

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
  dateTimePickerProps?: DateTimeLocalInputProps & {
    minDate?: Date;
    maxDate?: Date;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
    includeTime?: boolean;
  };
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
  textAreaMaxHeight?: number;
  textAreaMinHeight?: number;
  textAreaIcon?: React.ElementType;
  textAreaMaxLines?: number;
  textAreaLineWrapping?: boolean;
  textAreaShowCharCount?: boolean;
  textAreaMaxCharCount?: number;
  withGridFilter?: boolean;
  /**
   * @description
   * This prop is used to determine the entity and field that will be used for the field filter grid.
   */
  filterFieldConfig?: {
    // for field filter grid
    entity?: string;
    field?: string;
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
  action_type?: string;
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

export interface IFeatures {
  enableLockFormView?: boolean;
  enableLockFormCopy?: boolean;
  enableLockFormEllipsis?: boolean;
  enableViewFormEllipsis?: boolean;
  enableViewFormCopy?: boolean;
  enableViewFormPaste?: boolean;
  enableViewFormClear?: boolean;
  enableUnlockFormFilter?: boolean;
  enableFormHostViewActions?: boolean;
  enableFormHostLockActions?: boolean;
}

export interface ICustomActions {
  label: string;
  icon?: ReactElement;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

interface IFilterGridConfig {
  selectedRecords?: any[];
  pluck?: string[];
  pluck_object?: Record<string, string[]>;
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
  grid_data?: {
    items: Record<string, any>[];
    totalCount: number;
  };
  onFilterFieldChange?: (
    search_params: ISearchParams,
    options: Record<string, any>,
  ) =>
    | {
        totalCount: number;
        items: any[];
        currentPage: number;
        totalPages: number;
      }
    | undefined;
  handleSelectFieldFilterGrid?: (args: any) => Promise<any>;
  fieldFilterGridColumns?: string[];
}

export interface ISearchParams {
  entity: string;
  pluck?: any;
  pluck_object?: any;
  current?: number;
  limit?: number;
  advance_filters?: {
    type: string;
    values: string[];
    field: string;
    operator: string;
    entity?: string;
  }[];

  sorting?: any[];
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
  features?: IFeatures;
  customFormHostViewFormActions?: ICustomActions[];
  customFormHostLockFormActions?: ICustomActions[];
  customFormFilterViewFormActions?: ICustomActions[];
  customFormFilterLockFormActions?: ICustomActions[];
  /**
   * @description
   * This prop is used to determine if the form filter will override the current wizard record.
   * If true, the form filter will override the current wizard record which includes the tab name and the url identifier.
   * Else, the form filter will not override the current wizard record.
   */
  create_mode?: boolean;
}

export type {
  IButtonConfig,
  ICheckboxOptions,
  IField,
  IFilterGridConfig,
  IHandleSubmit,
  IOnFormListen,
  IPropsForms,
  IRadioOptions,
  IReturnOnSelectRecords,
  ISelectOptions,
  IUserFormField,
  OptionType,
};
