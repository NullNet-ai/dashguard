import { type ColumnDef } from '@tanstack/react-table';
import type React from 'react';
import * as AvatarPrimitive from "@radix-ui/react-avatar"
// eslint-disable-next-line no-duplicate-imports
import {
  DetailedHTMLProps,
  ImgHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type HTMLInputTypeAttribute,
  type ReactElement,
  type ReactNode,
} from 'react';
import { type DropzoneOptions } from 'react-dropzone';
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type Field,
  type UseFormReturn,
} from 'react-hook-form';

import {
  type AppRouterKeys,
  type TActionType,
} from '~/components/platform/Grid/types';
import {
  type DateGranularity,
  type DateTimeLocalInputProps,
  type NaturalLanguageInputProps,
} from '~/components/ui/smart-datetime-picker';
import { type SwitchProps } from '~/components/ui/switch';
import { type TimePickerProps } from '~/components/ui/time-picker';

import {
  type TDisplayType,
  type DateTimeGranularity,
  type TFormSchema,
  type TFormType,
  type TSelectionType,
} from './types';

import { type ComponentType } from 'react'; // Add this import at the top
import { type ComboBoxProps } from '~/components/ui/combobox';
import { EntityVariableOption } from '~/components/ui/rich-text-editor/components/entity-variable';
import { type ComboSelectProps } from '~/components/ui/combo-select';
import { ButtonIconProps, ButtonProps, IconProps, TooltipProps } from '~/components/ui/button';
import { AvatarBadge, AvatarStatus } from '~/components/ui/avatar';
import { BadgeProps } from '~/components/ui/badge';
import { AdaptiveBadgeDisplayProps } from '~/components/ui/adaptive-badge-display';
import { MessageThreadProps } from '~/components/ui/message';

interface OptionType {
  label: string;
  value: string;
}
interface RichTextConfig {
  output?:'html' | 'json' | 'text'
  plainTextMode?:boolean
  plainTextConfig?: {
    multiline?: boolean;
    maxHeight?: string;
  };
  customDropdowns?: Array<{
    id: string;
    buttonLabel: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    options: Array<{
      label: string;
      value: string;
    }>;
    formatInsertedValue?: (option: { label: string; value: string }) => string;
    onSelect?: (option: { label: string; value: string }) => void;
    disabled?:boolean;
    isFilterMode?:boolean;
  }>;
}
interface DraggableConfig {
  parentProps?: any;
  fields: IField & {
    selectOptions?: ISelectOptions[];
    radioOptions?: IRadioOptions[];
    checkboxOptions?: ICheckboxOptions[];
    formType?:
    | 'input'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'textarea'
    | 'number-input'
    | 'smart-date'
    | 'time-picker';
  };
}

type MultiFieldConfig = DraggableConfig & {
  fieldOptions: MultiFieldOption[];
};
export interface CustomFieldProps {
  field: ControllerRenderProps<Record<string, any>, string>;
  fieldState: ControllerFieldState;
  form: UseFormReturn<Record<string, any>>;
  formKey: string;
  fieldConfig: IField;
  selectOptions?: Record<string, ISelectOptions[]>;
}
interface MultiFieldOption {
  label: string;
  name?: string;
  fieldType: 'input' | 'select' | 'radio' | 'checkbox';
  options?: OptionType[];
  placeholder?: string;
}

interface DateRangeConfig {
  withTime?: boolean;
  is24Hour?: boolean;
  showPresets?: boolean;
}

interface IField {
  id: string;
  className?: HTMLAttributes<HTMLDivElement>['className'];
  fieldClassName?: HTMLAttributes<HTMLDivElement>['className'];
  fieldStyle?: React.CSSProperties;
  formType?: TFormType;
  creatable?: boolean;
  name: string;
  label?: string;
  detail?: string;
  placeholder?: string;
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  alertVariant?: 'error' | 'warning' | 'info' | 'success';
  alertTitle?: string;
  alertContent?: string;
  alertIcon?: ElementType<any> | undefined;
  alertWithAccentBorder?: boolean;
  separatorType?: 'dashed' | 'decorative';
  dateGranularity?: DateTimeGranularity;
  dateMinDate?: Date;
  dateMaxDate?: Date;
  timePickerProps?: TimePickerProps;
  dateRangeConfig?: DateRangeConfig;  
  dateTimePickerProps?: DateTimeLocalInputProps & {
    granularity?: DateGranularity
    minDate?: Date
    maxDate?: Date
    disablePastDates?: boolean
    disableFutureDates?: boolean
    includeTime?: boolean
    useTimePicker?: boolean
    displayFormat?: 'MM/DD/YYYY' | 'YYYY-MM-DD'
    is24Hour?: boolean
    enableFormattedDate?:boolean
    transformValuesToArray?:boolean
  }
  dateInputProps?: NaturalLanguageInputProps
  description?: string
  switchConfig?: SwitchProps
  draggableConfig?: [DraggableConfig?, DraggableConfig?, DraggableConfig?]
  multiFieldConfig?: MultiFieldConfig
  comboboxConfig?: ComboBoxProps
  selectConfig?:Partial<ComboSelectProps>
  required?: boolean
  type?: HTMLInputTypeAttribute | undefined
  customRender?: React.JSX.Element
  min?: number
  max?: number
  step?: number
  hasFormMessage?: boolean
  render?: (props: CustomFieldProps) => React.ReactNode
  checkboxOrientation?: 'horizontal' | 'vertical'
  radioOrientation?: 'horizontal' | 'vertical'
  sliderLabel?: (value: number | undefined) => ReactNode
  sliderLabelPosition?: 'top' | 'bottom'
  fileDropzoneOptions?: DropzoneOptions
  selectIcon?: ElementType
  // InfiniteScroll configuration for select options
  selectInfiniteScroll?: {
    enabled?: boolean;
    initialLimit?: number;
    loadMoreStep?: number;
    scrollThreshold?: number;
    hasMore?: boolean;
    loadingIndicator?: ReactNode;
    endMessage?: ReactNode;
    scrollableTarget?: string;
  }
  multiSelectMaxSelected?: number;
  multiSelectDelay?: number;
  multiSelectHidePlaceholderWhenSelected?: boolean
  multiSelectTriggerSearchOnFocus?: boolean
  multiSelectOnMaxSelected?: ((maxLimit: number) => void) | undefined
  multiSelectLoadingIndicator?: ReactNode
  multiSelectEmptyIndicator?: ReactNode
  multiSelectHideClearAllButton?: boolean
  multiSelectShowCreatableItem?: boolean
  multiSelectUseStringValues?: boolean
  richTextConfig?: RichTextConfig
  multiSelectRenderOption?: (option: OptionType) => React.ReactNode;
  multiSelectRenderBadge?: (option: OptionType, handleUnselect: (option: OptionType) => void) => React.ReactNode;
  multiSelectOnSearch?: Record<string, (search: string) => Promise<OptionType[]>>;
  richTextOutput?: 'html' | 'json' | 'text'
  richTextEntityOptions?: Array<{
    label: string;
    value: string;
  }>;
  richTextVariableOptions?: Array<{
    label: string;
    value: string;
  }>;
  inputRightAddOns?: ReactNode | string
  inputLeftAddOns?: ReactNode | string
  isMultiSelectAlphabetical?: boolean
  options?: {
    phoneNumberType?: TSelectionType;
    phoneEmailType?: TSelectionType;
    inputsType?: TSelectionType;
  };
  textAreaMaxHeight?: number;
  textAreaMinHeight?: number;
  textAreaMaxWidth?: number;
  textAreaMinWidth?: number;
  textAreaIcon?: React.ElementType;
  textAreaMaxLines?: number;
  textAreaLineWrapping?: boolean;
  textAreaShowCharCount?: boolean;
  textAreaMaxCharCount?: number;
  withGridFilter?: boolean;
  gridPosition?: 'left' | 'right';
  /**
   * @description
   * This prop is used to determine the entity and field that will be used for the field filter grid.
   */
  filterFieldConfig?: {
    // for field filter grid
    entity?: string;
    field?: string;
  };
  selectSearchable?: boolean;
  accuracy?: number;
  selectEnableCreate?: boolean;
  multiSelectEnableCreate?: boolean;
  selectOnCreateRecord?:
  | {
    fieldIdentifier: string;
    entity: string;
    customParams?: Record<string, any>;
  }
  | ((text: string) => Promise<ISelectOptions>);
  selectOnCreateValidate?: (
    text: string,
  ) => Promise<{ valid: boolean; message?: string }>;
  showPasswordStrengthBar?: boolean;
  showPasswordGenerator?: boolean;
  hasComplexValidation?: boolean;
  isCustomFormField?: boolean;
  groupConfig?: {
    prefix?: string;
    components?: ComponentType<any>[] | JSX.Element[];
    defaultComponent?: ComponentType<any>;
  };
	codeEditorProps?: ICodeEditor & {
		enable_editor_tools?: boolean;
		enable_auto_height?: boolean; 
		defaultTheme?: 'vs-light' | 'vs-dark' | 'hc-black' | 'hc-light';
		minHeight: string;
		maxHeight?: string;
	};
  imageConfig?: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
  buttonConfig?: ButtonProps & IconProps & TooltipProps & React.RefAttributes<HTMLButtonElement>
  avatarConfig?: {
    avatar: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
      statusProps?: Omit<React.ComponentPropsWithoutRef<typeof AvatarStatus>, "containerRef">;
      badgeProps?: Omit<React.ComponentPropsWithoutRef<typeof AvatarBadge>, "containerRef">;
      size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    },
    image?: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
    fallback?:   React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
    fallbackText?: string
  }
  badgeConfig?: BadgeProps
  adaptiveBadgeConfig?: AdaptiveBadgeDisplayProps & React.RefAttributes<HTMLDivElement>
  messageThreadConfig?: MessageThreadProps

}

interface ISelectOptions {
  value: string;
  label: string;
}

interface IRadioOptions {
  value: string | boolean;
  label: string;
}

interface ICheckboxOptions {
  value: string | boolean;
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
  enableAutoSelect?: boolean;
  formHostInitialView?: 'lock' | 'unlock';
  enableFormFilterCreate?: boolean;
}

export interface ICustomActions {
  label: string;
  icon?: ReactElement;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

interface SortingOption {
  id: string;
  desc: boolean;
  sort_key: string;
}

interface QueryParams extends ISearchParams {
  entity: string;
  pluck?: string[];
  default_advance_filters?: {
    type: string;
    values: string[];
    field: string;
    operator: string;
    entity?: string;
  }[]; // Replace with actual type if known
  default_sorting?: SortingOption[];
}

interface IFilterGridConfig {
  selectedRecords?: any[];
  pluck?: string[];
  pluck_object?: Record<string, string[]>;
  current?: number;
  limit?: number;
  filter_entity: string;
  main_entity_id: string;
  is_same_entity_id?: boolean;
  statusesIncluded?: string[];
  label?: string;
  hideSearch?: boolean;
  gridColumns: ColumnDef<any>[];
  actionType: TActionType;
  searchConfig?: {
    router?: AppRouterKeys;
    resolver?: string;
    query_params?: QueryParams;
  };
  onClipboardPaste?: (
    data: Record<string, any>,
    form: any,
    onSubmitFormGrid?: any,
  ) => any;
  renderComponentSelected?: (record: any) => React.JSX.Element;
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
  customConfig?: Record<string, any>;
  fieldConfig?: Field;
  formProps?: any;
  showCreateFormGrid?: boolean;
  enableFormRegisterToParent?: boolean;
  formLabel?: string;
  formKey: string;
  persistTimeout?: number;
  fields: IField[];
  buttonHeaderRender?: React.JSX.Element;
  defaultValues?: Record<string, any>;
  formSchema: TFormSchema;
  currencyInputOptions?: Record<string, OptionType[]>;
  selectOptions?: Record<string, ISelectOptions[]>;
  // multiSelectOptions?: Record<string, Option[]>;
  multiSelectOptions?: Record<string, any[]>;
  // multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>;
  multiSelectOnSearch?: Record<string, (search: string) => Promise<any[]>>;
  radioOptions?: Record<string, IRadioOptions[]>;
  checkboxOptions?: Record<string, ICheckboxOptions[]>;
  fetching?: boolean;
  defaultDisplay?: 'expanded' | 'collapsed';
  myParent?: 'wizard' | 'record';
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
    options: {
      appendButtonKey?: string;
    },
    displayType: TDisplayType,
    handleUpdateDisplayType: (type: TDisplayType) => void,
    // ) => ReactElement<typeof FormField> | ReactElement<typeof FormField>[]; // Strictly allows FormField or array of FormField components
  ) => ReactElement<any> | ReactElement<any>[];
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

interface IFieldFilterActions {
  onBlur?: () => void;
  onFocus?: () => void;
  handleSearch?: (search: string) => void;
  ref?: any;
}

interface IGridData {
  items: any[];
  totalCount: number;
  advance_filters?: any[];
  sorting?: any[];
}

interface ICodeEditor {
	enable_editor_tools?: boolean;
	enable_auto_height?: boolean; 
	defaultTheme?: 'vs-light' | 'vs-dark' | 'hc-black' | 'hc-light';
	minHeight: string;
	maxHeight?: string;
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
  IFieldFilterActions,
  IGridData,
	ICodeEditor
};
