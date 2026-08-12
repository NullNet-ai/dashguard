'use client';

import { useState } from 'react';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import MultipleSelector, { type Option } from '~/components/ui/multi-select';
import { cn } from '~/lib/utils';
import { useToast } from '~/context/ToastProvider';

// Enhanced Option interface with tracking
interface TrackedOption extends Option {
  order: any;
  index: any;
}

const SelectMultiCustomComponent = (args: any) => {
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
  const [selectOptions, setSelectOptions] = useState(field.selectOptions || []);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  
  // Configuration
  const isAlphabeticalSorting = field.isMultiSelectAlphabetical ?? true;
  const useStringValues = field.multiSelectUseStringValues ?? false;
  const enableTracking = true;

  const commonProps = {
    disabled: ISDisabled,
    className: `h-10 px-3 ${error && 'border-destructive'}`,
  };

  // Convert field options to Option format for MultipleSelector
  const multiSelectOptions: TrackedOption[] = selectOptions.map((opt: any) => ({
    label: opt.label,
    value: opt.value,
    disable: opt.disabled,
  }));

  // Get current form value and convert to Option array
  const currentValue = form.getValues(`${fieldConfig.name}.${index}.${field.name}`) || [];
  const selectedOptions: TrackedOption[] = Array.isArray(currentValue) 
    ? currentValue.map((val: any, selectionOrder: number) => {
        if (typeof val === 'string') {
          const option = multiSelectOptions.find(opt => opt.value === val);
          const originalIndex = multiSelectOptions.findIndex(opt => opt.value === val);
          const baseOption = option || { label: val, value: val };
          
          return enableTracking 
            ? { 
                ...baseOption, 
                order: selectionOrder + 1, 
                index: originalIndex >= 0 ? originalIndex + 1 : selectionOrder + 1 
              }
            : baseOption;
        }
        
        return enableTracking && !val.order 
          ? { 
              ...val, 
              order: selectionOrder + 1, 
              index: val.index || selectionOrder + 1 
            }
          : val;
      })
    : [];

  // Enhanced change handler with tracking
  const handleMultiSelectChange = (newOptions: Option[] | string[]) => {
    let valueToSet: any;
    
    // Handle empty array case - clear the form value
    if (!newOptions || newOptions.length === 0) {
      valueToSet = [];
    } else if (useStringValues) {
      // If using string values, convert Option[] to string[]
      valueToSet = Array.isArray(newOptions) && newOptions.length > 0 && typeof newOptions[0] === 'object'
        ? (newOptions as Option[]).map(opt => opt.value)
        : newOptions;
    } else {
      // If using Option objects, ensure we have Option[] with tracking
      if (Array.isArray(newOptions) && newOptions.length > 0 && typeof newOptions[0] === 'string') {
        valueToSet = (newOptions as string[]).map((val, selectionOrder) => {
          const originalIndex = multiSelectOptions.findIndex(opt => opt.value === val);
          const baseOption = { label: val, value: val };
          
          return enableTracking 
            ? { 
                ...baseOption, 
                order: selectionOrder + 1,
                index: originalIndex >= 0 ? originalIndex + 1 : selectionOrder + 1
              } as TrackedOption
            : baseOption;
        });
      } else {
        // Add tracking to existing options
        valueToSet = enableTracking 
          ? (newOptions as Option[]).map((opt, selectionOrder) => {
              const originalIndex = multiSelectOptions.findIndex(option => option.value === opt.value);
              return {
                ...opt,
                order: selectionOrder + 1,
                index: originalIndex >= 0 ? originalIndex + 1 : selectionOrder + 1
              } as TrackedOption;
            })
          : newOptions;
      }
    }

    form.setValue(`${fieldConfig.name}.${index}.${field.name}`, valueToSet, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // Enhanced create new record functionality with tracking
  const createNewRecord = async (query: string) => {
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
      }
      
      // Add tracking to created record
      const trackedCreatedData = enableTracking 
        ? { 
            ...createdData, 
            order: selectedOptions.length + 1, 
            index: selectedOptions.length + 1 
          }
        : createdData;
      
      return trackedCreatedData as TrackedOption;
    } catch (error) {
      toast?.error('Failed to create new option');
      console.error('Error creating option:', error);
    } finally {
      setIsCreateLoading(false);
    }
  };

  const sortedOptions = isAlphabeticalSorting
    ? multiSelectOptions?.sort((a, b) => a.label?.localeCompare(b.label))
    : multiSelectOptions;

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
          <MultipleSelector
            value={selectedOptions}
            onChange={handleMultiSelectChange}
            readOnly={ISDisabled}
            data-test-id={`${formKey}-msel-${field.name}`}
            disabled={ISDisabled}
            className={
              !!error
                ? "border-destructive"
                : "flex items-center border border-input py-0 outline-offset-2 ring-ring ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring"
            }
            inputProps={{
              // @ts-expect-error - Not able to pass data-test-id on types
              "data-test-id": `${formKey}-inp-${field.name}`,
              className: `flex w-full rounded-md border bg-background px-2 py-0 text-md file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-md/6 outline-none ring-0 border-0 focus:ring-transparent ${ISDisabled && "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100 "}`
            }}
            useStringValues={useStringValues}
            loadingIndicator={
              field.multiSelectLoadingIndicator ?? (
                <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
                  loading...
                </p>
              )
            }
            emptyIndicator={field.multiSelectEmptyIndicator ?? undefined}
            onMaxSelected={field.multiSelectOnMaxSelected ?? undefined}
            maxSelected={field.multiSelectMaxSelected ?? undefined}
            delay={field.multiSelectDelay ?? 500}
            hidePlaceholderWhenSelected={
              field.multiSelectHidePlaceholderWhenSelected ?? false
            }
            creatable={(field.multiSelectEnableCreate || field.selectEnableCreate) ?? false}
            triggerSearchOnFocus={
              field.multiSelectTriggerSearchOnFocus ?? false
            }
            defaultOptions={sortedOptions}
            options={sortedOptions}
            placeholder={field.placeholder}
            hideClearAllButton={
              field.multiSelectHideClearAllButton ??
              field.multiSelectMaxSelected === 1
            }
            onCreateRecord={field.selectOnCreateRecord
              ? createNewRecord
              : undefined}
            showCreatableItem={field.multiSelectShowCreatableItem}
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

export default SelectMultiCustomComponent;
