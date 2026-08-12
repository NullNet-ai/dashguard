'use client';

import { useState } from 'react';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  ComboSelect,
  type ComboSelectOption,
} from '~/components/ui/combo-select';
import { cn } from '~/lib/utils';
import { useToast } from '~/context/ToastProvider';

const CustomComponent = (args: any) => {
  const {
    index,
    field,
    form,
    fieldConfig,
    formRenderProps,
    error,
    formKey
  } = args;
  const isDisabled = formRenderProps.field.disabled || fieldConfig.disabled;
  const ISDisabled = isDisabled || field.disabled;
  const { register } = form;
  const toast = useToast();

  // State for creatable functionality
  const [query, setQuery] = useState('');
  const [selectOptions, setSelectOptions] = useState(field.selectOptions || []);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const commonProps = {
    disabled: ISDisabled,
    className: `h-10 px-3 ${error && 'border-destructive'}`,
  };

  const handleChanged = (newValue: ComboSelectOption | null) => {
    form.setValue(`${fieldConfig.name}.${index}.${field.name}`, newValue?.value || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // Convert field options to ComboSelectOption format
  const comboOptions: ComboSelectOption[] = selectOptions.map((opt: any) => ({
    label: opt.label,
    value: opt.value,
    status: opt.status,
    avatar: opt.avatar,
    avatarFallback: opt.avatarFallback,
    secondaryText: opt.secondaryText,
  }));

  // Find the selected value
  const selectedValue = comboOptions.find(
    (opt) => opt.value === form.getValues(`${fieldConfig.name}.${index}.${field.name}`)
  ) || null;

  // Create new option functionality
  const createNewOption = async () => {
    if (!field?.selectOnCreateRecord) {
      toast?.error('selectOnCreateRecord is not defined in field config');
      return;
    }

    if (isCreateLoading) return;

    // Validate if needed
    if (field?.selectOnCreateValidate) {
      const validation = await field?.selectOnCreateValidate(query);
      if (!validation?.valid) {
        toast?.error(validation?.message || 'Invalid Input');
        return;
      }
    }

    setIsCreateLoading(true);
    try {
      let createdData = null;
      if (typeof field?.selectOnCreateRecord === 'function') {
        createdData = await field?.selectOnCreateRecord(query);
      } else {
        // Handle object-based creation if needed
        const { entity, fieldIdentifier, customParams } = field?.selectOnCreateRecord ?? {};
        // You may need to import createRecord function if using this approach
        // createdData = await createRecord({
        //   entity,
        //   fieldIdentifier,
        //   data: {
        //     ...(customParams ?? {}),
        //     [fieldIdentifier]: query,
        //   },
        // });
      }

      // Check if option already exists
      const alreadyExists = selectOptions.some(
        (opt: any) => opt.value === createdData?.value,
      );
      
      if (!alreadyExists && createdData) {
        const newOptions = [...selectOptions, createdData];
        setSelectOptions(newOptions);
        form.setValue(`${fieldConfig.name}.${index}.${field.name}`, createdData?.value || '', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setQuery('');
      }
    } catch (error) {
      toast?.error('Failed to create new option');
      console.error('Error creating option:', error);
    } finally {
      setIsCreateLoading(false);
    }
  };

  const isOptionsExist = selectOptions?.find(
    (p: any) => p.label?.toLowerCase() === query?.trim().toLowerCase(),
  );

  // Create custom render functions for ComboSelect
  const renderCreateOption =
    field?.selectEnableCreate && query && !isOptionsExist ? (
      <button
        type="button"
        className="block w-full cursor-pointer truncate bg-primary px-3 py-2 text-start text-md font-bold text-secondary-foreground text-white hover:bg-primary hover:text-primary-foreground"
        data-test-id={`${formKey}-opt-create-new-${field.name}`}
        onClick={createNewOption}
        disabled={isCreateLoading}
      >
        {isCreateLoading ? 'Creating...' : `Create "${query}"`}
      </button>
    ) : null;

  // Only show empty state when not creatable or when there's no query
  const renderEmptyState =
    !field?.selectEnableCreate ||
    (field?.selectEnableCreate && !query) ? (
      <span
        className="ms-3 block truncate text-md group-data-[selected]:font-semibold"
        data-test-id={`${formKey}-opt-not-found-${field.name}`}
      >
        {field?.label
          ? `No ${field?.label} found.`
          : 'No more options.'}
      </span>
    ) : null;

  return (
    <FormItem>
      {index === 0 && <FormLabel>{field.label}</FormLabel>}
      <FormControl>
        {fieldConfig.readonly || field.readonly ? (
          <Input
            {...register(`${fieldConfig.name}.${index}.${field.name}`)}
            {...commonProps}
            readOnly
          />
        ) : (
          <ComboSelect
            options={comboOptions}
            value={selectedValue}
            onChange={handleChanged}
            placeholder={field.placeholder}
            disabled={ISDisabled}
            readOnly={fieldConfig.readonly || field.readonly}
            searchable={field.selectSearchable !== false}
            className="w-full"
            error={!!error}
            showCheckmarks={field.selectConfig?.showCheckmarks !== false}
            checkmarkPosition={field.selectConfig?.checkmarkPosition || 'right'}
            showStatus={field.selectConfig?.showStatus || false}
            showAvatars={field.selectConfig?.showAvatars || false}
            avatarSize={field.selectConfig?.avatarSize || 'xs'}
            renderCreateOption={renderCreateOption}
            renderEmptyState={renderEmptyState}
            onQueryChange={setQuery}
            testId={`${formKey}-select-${field.name}`}
            onCreateRecord={field?.selectEnableCreate ? createNewOption : undefined}
          />
        )}
      </FormControl>
      {error?.[index] && (
        <p
          id={field?.id}
          className={cn('py-1 text-md font-medium text-destructive')}
          data-test-id={`${formKey}-err-msg-${index + 1}-${fieldConfig.name}-${field.name}`}
        >
          {error?.[index]?.[field.name]?.message}
        </p>
      )}

      {(error?.root?.message || error?.message) && (
        <FormMessage
          data-test-id={`${formKey}-err-msg-${fieldConfig.name}-${field.name}`}
        />
      )}
    </FormItem>
  );
};

export default CustomComponent;
