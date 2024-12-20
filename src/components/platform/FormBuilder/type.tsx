import { type ColumnDef } from "@tanstack/react-table";
import {
  type ElementType,
  type HTMLAttributes,
  type HTMLInputTypeAttribute,
  type ReactElement,
} from "react";
import { type Field, type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { type FormField } from "~/components/ui/form";
import { type Option } from "~/components/ui/multi-select";
import { type TActionType } from "../Grid/types";
import { type DropzoneOptions } from "react-dropzone";
import {
  type DateGranularity,
  type DateTimeLocalInputProps,
  type NaturalLanguageInputProps,
} from "~/components/ui/smart-datetime-picker";

export type TDisplayType = "form" | "selected";
export type TFormType =
  | "input"
  | "input-grid"
  | "number-input"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "smart-date"
  | "file"
  | "multi-select"
  | "inputs"
  | "input-label-value"
  | "phone-input"
  | "email-input"
  | "date-range"
  | "address-input"
  | "slider"
  | "password"
  | "rich-text-editor"
  | "currency-input";

// Single |  Multiple
export type TType = "single" | "multiple";
type Granularity = "year" | "month" | "day" | "hour" | "minute" | "second";
export type OptionType = {
  label: string;
  value: string;
};
export interface IField {
  id: string;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  formType?: TFormType;
  withGridFilter?: boolean;
  creatable?: boolean;
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  dateGranularity?: Granularity;
  dateMinDate?: Date;
  dateMaxDate?: Date;
  dateTimePickerProps?: DateTimeLocalInputProps & {
    granularity?: DateGranularity;
    minDate?: Date;
    maxDate?: Date;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
    includeTime?: boolean;
  };
  dateInputProps?: NaturalLanguageInputProps;
  description?: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute | undefined;
  customRender?: React.JSX.Element;
  min?: number;
  max?: number;
  step?: number;
  radioOrientation?: "horizontal" | "vertical";
  sliderLabel?: (value: number | undefined) => React.ReactNode;
  sliderLabelPosition?: "top" | "bottom";
  fileDropzoneOptions?: DropzoneOptions;
  selectIcon?: ElementType;
  multiSelectMaxSelected?: number;
  multiSelectDelay?: number;
  multiSelectHidePlaceholderWhenSelected?: boolean;
  multiSelectTriggerSearchOnFocus?: boolean;
  multiSelectOnMaxSelected?: ((maxLimit: number) => void) | undefined;
  multiSelectLoadingIndicator?: React.ReactNode;
  multiSelectEmptyIndicator?: React.ReactNode;
  multiSelectHideClearAllButton?: boolean;

  richTextOutput?: "html" | "json" | "text";
  inputRightAddOns?: React.ReactNode | string;
  inputLeftAddOns?: React.ReactNode | string;
  isMultiSelectAlphabetical?: boolean;
  options?: {
    phoneNumberType?: TType;
    phoneEmailType?: TType;
    inputsType?: TType;
  };
  textAreaMaxHeight?: number;
  textAreaMinHeight?: number;
  textAreaIcon?: React.ElementType;
  textAreaMaxLines?: number;
  textAreaLineWrapping?: boolean;
  textAreaShowCharCount?: boolean;
  textAreaMaxCharCount?: number;
  selectSearchable?: boolean;
}

export interface ISelectOptions {
  value: string;
  label: string;
}

export interface IRadioOptions {
  value: string;
  label: string;
}

export interface ICheckboxOptions {
  value: string;
  label: string;
}
export interface IHandleSubmit<T = Record<string, any>> {
  data: T;
  form?: UseFormReturn<Record<string, any>, any, undefined>;
  main_entity_id?: string;
  filter_entity?: string;
  action_type?: string;
}

export interface IOnFormListen
  extends UseFormReturn<Record<string, any>, any, undefined> {
  test?: any;
}

export interface IButtonConfig {
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

interface IReturnOnFieldFilterRecords {
  items: any[];
}

export interface IFilterGridConfig {
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
  onFieldFilterRecords?: ({
    filter_value,
  }: {
    filter_value: string | number;
  }) => Promise<IReturnOnFieldFilterRecords>;
  onSelectFieldFilterRecords?: ({
    filter_value,
  }: {
    filter_value: string | number;
  }) => Promise<IReturnOnFieldFilterRecords>;
}
export interface IPropsForms {
  customDesign?: {
    formClassName?: string;
    headerClassName?: string;
  };
  fieldConfig?: Field;
  formProps?: any;
  showCreateFormGrid?: boolean;
  enableFormRegisterToParent?: boolean;
  formLabel?: string;
  formKey: string;
  persistTimeout?: number;
  fields: IField[];
  buttonHeaderRender?: JSX.Element;
  defaultValues?: Record<string, any>;
  formSchema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>;
  currencyInputOptions?: Record<string, OptionType[]>;
  selectOptions?: Record<string, ISelectOptions[]>;
  multiSelectOptions?: Record<string, Option[]>;
  multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>;
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
  ) => ReactElement<typeof FormField> | ReactElement<typeof FormField>[]; // Strictly allows FormField or array of FormField components
}

export interface IUserFormField {
  error?: {
    label: { message: string };
    value: { message: string };
  }[];
}

export interface IFieldFilterActions {
  onBlur?: () => void;
  onFocus?: () => void;
  handleSearch?: (search: string) => void;
  ref?: any;
}
