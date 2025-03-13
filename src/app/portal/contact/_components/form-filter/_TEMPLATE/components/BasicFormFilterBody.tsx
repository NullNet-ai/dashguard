import { Button as Button2 } from '@headlessui/react';
import {
  EyeSlashIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Eye, Infinity, Loader2, Repeat, X } from 'lucide-react';
import React, { Fragment, useMemo, useState } from 'react';
import {
  type UseFieldArrayRemove,
  type UseFieldArrayUpdate,
  type UseFormReturn,
} from 'react-hook-form';
import { type z } from 'zod';

import FormFilterGridLayout from '~/components/platform/FormBuilder/components/ui/FormFilterGridLayout';
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule';
import FormFilterOpenedActions from '~/components/platform/FormBuilder/components/ui/layout/opened/components/FormFilterOpenedActions';
import SelectedActions from '~/components/platform/FormBuilder/components/ui/layout/selected/components/SelectedActions';
import {
  type ICustomActions,
  type IField,
  type IFilterGridConfig,
} from '~/components/platform/FormBuilder/types';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

import { GLOBAL_PARENT_VARIABLE_KEY } from '../constants';
import CreateUpdateButton from './buttons/CreateUpdate';
import ShowGridButton from './buttons/ShowGrid';
import { Separator } from '~/components/ui/separator';
import { Label } from '~/components/ui/label';

interface IBasicFormFilterBodyProps {
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
  isEditMode: boolean | undefined
  handleToggleEditMode: (index: number, edit_mode?: boolean) => void
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

const BasicFormFilterBody: React.FC<IBasicFormFilterBodyProps> = (props) => {
  const {
    fieldList,
    defaultValues,
    field,
    index,
    form,
    formSchema,
    prefix,
    filterGridConfig,
    isEditMode,
    handleToggleEditMode,
    onClickSubmit,
    onRemoveSelectedRecords,
    onSelectedGridRecords,
    update,
    remove,
  } = props;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFormOpened, setIsFormOpened] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);

  const handleSetIsSearchOpen = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleRemovedSelectedRecords = (
    field: Record<string, any>,
    index: number,
  ) => {
    onRemoveSelectedRecords(field, index);
  };

  const handleSubmitFieldValues = async () => {
    const isValid = await form?.trigger(`${GLOBAL_PARENT_VARIABLE_KEY}.${index}`);
    if (isValid) {
      const fieldData = form?.getValues(`${GLOBAL_PARENT_VARIABLE_KEY}.${index}`);
      onClickSubmit(index, fieldData);
      // Handle API submission for this specific fieldData
    } else {
      console.info(`Validation failed for index ${index}`);
    }
  };

  const handleListLoading = (loading: boolean) => {
    setIsListLoading(loading);
  };

  const handleResetForm = () => {
    if (field.code) {
      update(index, defaultValues);
    } else {
      remove(index);
    }
  };

  const handleChangeSelection = () => {
    handleToggleEditMode(index, true);
    // form.setValue(`${GLOBAL_PARENT_VARIABLE_KEY}.${index}.in_edit_mode`, true);
  };

  return (
    <Fragment key={field._id}>
      <div className="flex flex-row items-center justify-between">
        {!isSearchOpen && (
          <div>
            <Label className="text-lg font-bold">
              {GLOBAL_PARENT_VARIABLE_KEY} {index + 1}
            </Label>
          </div>
        )}

        <div
          className={cn(
            `me-4 ms-auto mt-4 flex justify-end gap-2`,
            `${isSearchOpen ? 'flex-col' : ''}`,
          )}
        >
          {isEditMode && (
            <div className="flex flex-row gap-x-2 self-end">
              <CreateUpdateButton
                field={field}
                handleSubmitFieldValues={handleSubmitFieldValues}
                index={index}
                isSearchOpen={isSearchOpen}
              />
              <ShowGridButton
                handleSetIsSearchOpen={handleSetIsSearchOpen}
                index={index}
                isListLoading={isListLoading}
                isSearchOpen={isSearchOpen}
              />
            </div>
          )}
          {/** ELLIPSIS ACTIONS  */}

          {/**UNLOCK */}
          {!isEditMode && (
            <SelectedActions
              customFormFilterLockFormActions={[
                {
                  icon: <Repeat className="h-4 w-4 text-foreground" />,
                  label: 'Change Selection',
                  onClick: handleChangeSelection,
                },
                {
                  icon: <X className="h-4 w-4 text-foreground" />,
                  label: 'Remove Selection',
                  onClick: () => {
                    handleRemovedSelectedRecords(field, index);
                  },
                },
              ]}
              features={{
                enableLockFormEllipsis: true,
                enableLockFormCopy: true,
                enableLockFormView: true,
              }}
              filterGridConfig={filterGridConfig}
              form={form}
            />
          )}
          {!form?.formState?.disabled &&
            isEditMode &&
            !isSearchOpen && (
              <FormFilterOpenedActions
                customFormFilterViewFormActions={
                  index !== 0
                    ? [
                        {
                          icon: <X className="h-4 w-4 text-foreground" />,
                          label: 'Remove',
                          onClick: handleResetForm,
                        },
                      ]
                    : []
                }
                features={{
                  enableViewFormClear: true,
                  enableViewFormCopy: true,
                  enableViewFormEllipsis: true,
                  enableViewFormPaste: true,
                  enableAutoSelect: false,
                }}
                /** TODO: MODIFY */
                filterGridConfig={filterGridConfig}
                form={form}
                selectedRecords={field.code ? [field] : []}
                onSubmitFormGrid={handleSubmitFieldValues}
                /** TODO: MODIFY */
                handleRemovedSelectedRecords={() => {
                  console.info('[Work if single filter grid]');
                }}
              />
            )}
          {isSearchOpen && (
            <FormFilterGridLayout
              className="w-full"
              filterGridConfig={filterGridConfig}
              handleCloseGrid={() => {
                console.info('Closing Grid...');
              }}
              handleListLoading={handleListLoading}
              handleSelectedGridRecords={(record) => {
                setIsSearchOpen(!isSearchOpen);
                onSelectedGridRecords(record);
              }}
              isFormOpen={isFormOpened}
            />
          )}
        </div>
      </div>

      {/** OPENED FORM LAYOUT */}
      {isEditMode && !isSearchOpen && (
        <div className="border-l-[3px] border-gray-200 pl-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormModule
              fields={fieldList}
              form={form}
              formKey={GLOBAL_PARENT_VARIABLE_KEY}
              formSchema={formSchema}
              gridConfig={filterGridConfig}
            />
          </div>
        </div>
      )}

      {/* SELECTED VIEW LAYOUT */}
      {!isEditMode && (
        <CardContent>
          <Fragment key={prefix}>
            <Card className="border-none shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">{field.code}</CardTitle>
              </CardHeader>
              <CardContent>
                {filterGridConfig?.renderComponentSelected ? (
                  filterGridConfig.renderComponentSelected(field)
                ) : (
                  <pre>{JSON.stringify(field, null, 2)}</pre>
                )}
              </CardContent>
            </Card>
            {/* {index !== records.length - 1 && <Separator />} */}
          </Fragment>
        </CardContent>
      )}
    </Fragment>
  );
};

export default BasicFormFilterBody;
