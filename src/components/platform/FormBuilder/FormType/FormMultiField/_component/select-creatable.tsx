import React, { useCallback, useMemo, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import {
  ComboSelect,
  type ComboSelectOption,
} from '~/components/ui/combo-select';
import {
  FormControl,
  FormItem,
} from '~/components/ui/form';
import { useToast } from '~/context/ToastProvider';

import { type IField, type ISelectOptions } from '../../../types';

interface IProps {
  field: IField & {
    selectOptions?: ISelectOptions[];
    selectEnableCreate?: boolean;
    selectOnCreateRecord?: (query: string) => Promise<any>;
    selectOnCreateValidate?: (query: string) => Promise<{ valid: boolean; message?: string }>;
    selectSearchable?: boolean;
  };
  fieldConfig: IField;
  index: number;
  selectOptions?: any;
  customname?: string;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  register: any;
  isDisabled?: boolean;
}

export default function SelectCreatable({
  field,
  fieldConfig,
  index,
  selectOptions,
  customname,
  form,
  register,
  isDisabled,
}: IProps) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<ComboSelectOption[]>(
    Array.isArray(selectOptions)
      ? selectOptions.map((option: any) => ({
          label: option.label,
          value: option.value,
        }))
      : []
  );
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const fieldNameCreatable = `${customname ? customname : `${fieldConfig.name}.${index}.${field.name}`}`;
  const currentValueCreatable = form.getValues(fieldNameCreatable);

  const selectedValueCreatable = useMemo(() => {
    const selectedOption = options?.find(
      (opt) => opt.value === currentValueCreatable,
    );
    return selectedOption
      ? {
          label: selectedOption.label,
          value: selectedOption.value,
        }
      : null;
  }, [currentValueCreatable, options]);

  const handleChangeCreatable = useCallback((newValue: ComboSelectOption | null) => {
    form.setValue(fieldNameCreatable, newValue?.value || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [form, fieldNameCreatable]);

  const createNewRecord = useCallback(async () => {
    if (!field?.selectOnCreateRecord) {
      toast.error('selectOnCreateRecord is not defined in field config');
      return;
    }

    if (isCreateLoading) {
      return;
    }

    if (field?.selectOnCreateValidate) {
      const validation = await field?.selectOnCreateValidate(query);
      if (!validation?.valid) {
        toast.error(validation?.message || 'Invalid Input');
        return;
      }
    }

    setIsCreateLoading(true);
    try {
      let createdData = null;
      if (typeof field?.selectOnCreateRecord === 'function') {
        createdData = await field?.selectOnCreateRecord(query);
      }

      if (createdData) {
        const alreadyExists = options.some(
          (opt) => opt.value === createdData?.value,
        );
        if (!alreadyExists) {
          const newOptions = [...options, {
            label: createdData.label,
            value: createdData.value,
          }];
          setOptions(newOptions);
          handleChangeCreatable({
            label: createdData.label,
            value: createdData.value,
          });
          setQuery('');
        }
      }
    } catch (error) {
      toast.error('Failed to create new record');
      console.error('Error creating record:', error);
    } finally {
      setIsCreateLoading(false);
    }
  }, [field, query, isCreateLoading, options, handleChangeCreatable, toast]);

  const isOptionsExist = useMemo(() => {
    return options?.find(
      (p) => p.label?.toLowerCase() === query?.trim().toLowerCase(),
    );
  }, [options, query]);

  const renderCreateOption = useMemo(() => {
    return field?.selectEnableCreate && query && !isOptionsExist ? (
      <button
        value={query}
        className="block w-full cursor-pointer truncate bg-primary px-3 py-2 text-start text-md font-bold text-secondary-foreground text-white hover:bg-primary hover:text-primary-foreground"
        onClick={() => {
          createNewRecord();
        }}
      >
        {isCreateLoading ? 'Creating...' : `Create "${query}"`}
      </button>
    ) : null;
  }, [field?.selectEnableCreate, query, isOptionsExist, isCreateLoading, createNewRecord]);

  const renderEmptyState = useMemo(() => {
    return !field?.selectEnableCreate ||
    (field?.selectEnableCreate && !query) ? (
      <span className="ms-3 block truncate text-md group-data-[selected]:font-semibold">
        {field?.label
          ? `No ${field?.label} found.`
          : 'No more options.'}
      </span>
    ) : null;
  }, [field?.selectEnableCreate, field?.label, query]);

  return (
    <FormItem>
      <FormControl>
        <ComboSelect
          {...register(fieldNameCreatable)}
          options={options}
          value={selectedValueCreatable}
          onChange={handleChangeCreatable}
          placeholder={field.placeholder}
          disabled={isDisabled}
          searchable={field.selectSearchable !== false}
          className="w-full"
          renderCreateOption={renderCreateOption}
          renderEmptyState={renderEmptyState}
          onQueryChange={setQuery}
          onCreateRecord={
            field?.selectEnableCreate ? createNewRecord : undefined
          }
        />
      </FormControl>
    </FormItem>
  );
}