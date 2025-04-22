import { MinusCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule';
import {
  IField,
  type ISelectOptions,
} from '~/components/platform/FormBuilder/types';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { cn } from '~/lib/utils';
import DateRangePicker from '../components/date-range-picker';
import { OPERATORS, USE_CUSTOM_RENDER } from '../constants';
import { ZodSchema } from '../schemas/filter';
import { searchRecords } from './search';

// Simplified component for the Add Filter button
export function FilterGroupActions({
  onAppendFilter,
}: {
  onAppendFilter: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onAppendFilter}
      className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
    >
      <Plus className="h-4 w-4" />
      Add Filter
    </Button>
  );
}

// Simplified component for individual filter group
// Add this state at the top of your FilterGroup component
export function FilterGroup({
  groupIndex,
  form,
  fields,
  columns,
  onRemoveFilter,
  onUpdateJunctionOperator,
  searchConfig,
}: {
  groupIndex: number;
  form: any;
  fields: any[];
  columns: Array<{
    label: string;
    accessorKey: string;
    search_config?: any;
    data_type?: string;
  }>;
  onRemoveFilter: (index: number) => void;
  onUpdateJunctionOperator: (index: number, operator: string) => void;
  searchConfig: any;
}) {
  // Calculate the number of criteria filters to determine when to show delete button
  const criteriaFilters = fields.filter((filter) => filter.type === 'criteria');
  const hasManyFilters = criteriaFilters.length > 1;

  // Add state to track loading state for each filter's multi-select
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );

  // Helper to set loading state for a specific field
  const setFieldLoading = (fieldPath: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [fieldPath]: isLoading,
    }));
  };

  return (
    <div className="space-y-1">
      <div>
        {fields.map((field, index) => {
          const prefix = `filterGroups.${groupIndex}.filters.${index}`;
          const filterData =
            form.getValues().filterGroups[groupIndex]?.filters[index];
          const field_data_type =
            columns?.find((column) => column.accessorKey === filterData.field)
              ?.data_type || 'string';

          const valuesFieldPath = `${prefix}.values`;
          const isValuesLoading = loadingStates[valuesFieldPath] || false;

          if (!filterData) return null;

          // Calculate the criteria index for this filter (for delete operation)
          const criteriaIndex =
            fields.slice(0, index + 1).filter((f) => f.type === 'criteria')
              .length - 1;

          return (
            <div key={field.id || index} className="">
              {filterData.type !== 'operator' && (
                <div
                  className={cn(
                    'grid items-end gap-1',
                    index === 0
                      ? 'grid-cols-[1fr_1fr_2fr_auto]'
                      : 'grid-cols-[auto_1fr_1fr_2fr_auto]',
                  )}
                >
                  {index > 0 && (
                    <Select
                      // Get the operator from the previous item if it's an operator type
                      value={
                        fields[index - 1]?.type === 'operator'
                          ? fields[index - 1].operator
                          : 'and'
                      }
                      onValueChange={(operator) =>
                        onUpdateJunctionOperator(index - 1, operator)
                      }
                    >
                      <SelectTrigger className="h-9 border-gray-200 bg-white">
                        <SelectValue placeholder="AND" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="and">AND</SelectItem>
                        <SelectItem value="or">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <FormModule
                    form={form}
                    formKey={`filterGroups.${groupIndex}.filters`}
                    formSchema={ZodSchema}
                    fields={
                      [
                        {
                          id: `${prefix}.field`,
                          formType: 'select',
                          name: `${prefix}.field`,
                          placeholder: 'Select a Field',
                          selectSearchable: true,
                        },
                        {
                          id: `${prefix}.operator`,
                          formType: 'select',
                          name: `${prefix}.operator`,
                          placeholder: 'Select an operator',
                          selectSearchable: true,
                        },
                        ...(filterData.operator &&
                          !['is_empty', 'is_not_empty'].includes(
                            filterData.operator,
                          ) &&
                          // adjust this based on future scenarios currently string, array uses multi select.
                          field_data_type !== 'datetime'
                          ? [
                            {
                              id: `${prefix}.values`,
                              formType: 'multi-select',
                              name: `${prefix}.values`,
                              placeholder: 'Enter the value',
                              multiSelectUseStringValues: true,
                              multiSelectShowCreatableItem: false,
                              multiSelectDelay: 300,
                              multiSelectEnableCreate: [
                                'contains',
                                'not_contains',
                              ].includes(filterData.operator || ''),
                              multiSelectLoadingIndicator: isValuesLoading ? (
                                <p className="py-2 text-center text-sm leading-6 text-muted-foreground">
                                  Loading options...
                                </p>
                              ) : undefined,
                              multiSelectEmptyIndicator: (
                                <p className="w-full text-center text-sm leading-6 text-muted-foreground">
                                  No matching options found
                                </p>
                              ),
                              multiSelectRenderOption: USE_CUSTOM_RENDER
                                ? renderOption
                                : undefined,
                              multiSelectRenderBadge: USE_CUSTOM_RENDER
                                ? renderBadge
                                : undefined,
                            },
                          ]
                          : []),
                        ...(filterData.field &&
                          field_data_type === 'datetime' &&
                          !['is_between', 'is_empty', 'is_not_empty'].includes(filterData.operator)
                          ? [
                            {
                              id: `${prefix}.values`,
                              formType: 'smart-date',
                              name: `${prefix}.values`,
                              placeholder: 'Enter the value',
                              dateTimePickerProps: {
                                transformValuesToArray: true,
                                enableFormattedDate: false,
                              },
                            },
                          ]
                          : []),
                        ...(filterData.field &&
                          field_data_type === 'datetime' &&
                          filterData.operator === 'is_between'
                          ? [
                            {
                              id: `${prefix}.values`,
                              formType: 'custom-field',
                              name: `${prefix}.values`,
                              placeholder: 'Select date range',
                              render: ({ field }:any) => (
                                <DateRangePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  defaultDisplayFormat="SHORT"
                                />
                              ),
                            }
                          ]
                          : []),
                      ] as IField[]
                    }
                    subConfig={{
                      //@ts-expect-error - Expect error
                      selectOptions: {
                        [`${prefix}.field`]:
                          columns?.map(
                            (column) =>
                              ({
                                label: column.label,
                                value: column.accessorKey,
                              }) as ISelectOptions,
                          ) || [],
                        [`${prefix}.operator`]: (): ISelectOptions[] => {
                          const fieldValue = form.getValues(`${prefix}.field`);

                          if (fieldValue) {
                            const field_data_type =
                              columns?.find(
                                (column) => column.accessorKey === fieldValue,
                              )?.data_type || 'string';
                            switch (field_data_type) {
                              case 'string':
                                return OPERATORS.filter((operator) =>
                                  operator.type.includes('string'),
                                ) as ISelectOptions[];
                              case 'array':
                                return OPERATORS.filter((operator) =>
                                  operator.type.includes('array'),
                                ) as ISelectOptions[];
                              case 'number':
                                return OPERATORS.filter((operator) =>
                                  operator.type.includes('number'),
                                ) as ISelectOptions[];
                              case 'datetime':
                                return OPERATORS.filter((operator) =>
                                  operator.type.includes('datetime'),
                                ) as ISelectOptions[];
                              default:
                                return OPERATORS.filter((operator) =>
                                  operator.type.includes('string'),
                                ) as ISelectOptions[];
                            }
                          }
                          return [];
                        },
                      } as Record<
                        string,
                        ISelectOptions[] | (() => ISelectOptions[])
                      >,
                      multiSelectOnSearch: {
                        [`${prefix}.values`]: async (searchTerm: string) => {
                          // Track loading state
                          setFieldLoading(valuesFieldPath, true);

                          const formValues = form.getValues(`${prefix}.field`);

                          if (!formValues) return [];
                          try {
                            // Use the unified search function
                            const results = await searchFilterValues({
                              searchTerm,
                              searchConfig,
                              field_name: formValues,
                              fieldConfig:
                                columns.find(
                                  (item) => item.accessorKey === formValues,
                                )?.search_config || {},
                            });
                            return results;
                          } finally {
                            // Always reset loading state when done
                            setFieldLoading(valuesFieldPath, false);
                          }
                        },
                      },
                    }}
                  />
                  {/* Show delete button if there's more than one criteria filter */}
                  {hasManyFilters && (
                    <Button
                      onClick={() => onRemoveFilter(criteriaIndex)}
                      variant="ghost"
                    >
                      <MinusCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Custom render functions for the multi-select component
export const renderOption = (option: { value: string; label: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
        {option.label.charAt(0).toUpperCase()}
      </div>
      <span>{option.label}</span>
    </div>
  );
};

export const renderBadge = (
  option: { value: string; label: string },
  handleUnselect: (option: { value: string; label: string }) => void,
) => {
  return (
    <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-blue-700">
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-xs font-semibold text-blue-700">
        {option.label.charAt(0).toUpperCase()}
      </div>
      <span className="text-sm">{option.label}</span>
      <button
        onClick={() => handleUnselect(option)}
        className="ml-1 text-blue-500 hover:text-blue-700"
      >
        ×
      </button>
    </div>
  );
};

export const searchFilterValues = async ({
  searchTerm,
  searchConfig,
  fieldConfig,
  field_name,
}: {
  searchTerm: string;
  searchConfig: any;
  fieldConfig: any;
  field_name: string;
}): Promise<Array<{ value: string; label: string }>> => {
  try {
    const response = await searchRecords({
      value: searchTerm,
      field: field_name,
      entity: 'contact',
      searchConfig,
      fieldConfig,
    });

    return response;
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return []; // Return empty array on error
  }
};
