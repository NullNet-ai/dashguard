import {
  UseFieldArrayRemove,
  UseFieldArrayUpdate,
  UseFormReturn,
} from 'react-hook-form';
import {
  ICustomActions,
  IField,
  IFilterGridConfig,
  TDisplayType,
} from '~/components/platform/FormBuilder/types';

export interface IBasicFormFilterBodyProps {
  defaultValues: Record<string, any>;
  fieldList: IField[];
  field: Record<string, any>;
  index: number;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  prefix: string;
  formSchema: any;
  customFormFilterLockFormActions?: ICustomActions[];
  customFormFilterViewFormActions?: ICustomActions[];
  filterGridConfig: IFilterGridConfig;
  isEditMode: boolean | undefined;
  previousValues: Record<string, any>;
  handleCancel: (index: number) => void;
  handleToggleEditMode: (index: number, edit_mode?: boolean) => void;
  onSelectedGridRecords: (record: Record<string, any>) => void;
  onRemoveSelectedRecords: (field: Record<string, any>, index: number) => void;
  onClickSubmit: (
    index: number,
    field: Record<string, any>,
    options?: { action_type?: string },
  ) => void;
  update: UseFieldArrayUpdate<any, any>;
  remove: UseFieldArrayRemove;
}

export interface IMultipleFormProps {
  defaultValues: Record<string, any>;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  appendFormKey?: string;
  displayType: TDisplayType;
  filterGridConfig: IFilterGridConfig;
  formSchema: any;
  customFormFilterLockFormActions?: ICustomActions[];
  handleUpdateDisplayType: (type: TDisplayType) => void;
}
