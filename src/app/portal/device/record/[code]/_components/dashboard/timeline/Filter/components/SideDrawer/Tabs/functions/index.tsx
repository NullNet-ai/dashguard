import { MinusCircle, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { useManageFilter } from '../../Provider';

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

const required_fields = [
  'time_range',
  'resolution',
  'Graph Type',
]

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
  const {state} = useManageFilter()
  const {errors} = state ?? {}
  // Calculate the number of criteria filters to determine when to show delete button
  const criteriaFilters = fields.filter((filter) => filter.type === 'criteria');
  console.log("%c Line:76 🍣 fields", "color:#fca650", {fields, criteriaFilters});
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

  useEffect(() => {
    if (Object.keys(errors || {}).length > 0) { // Avoids unnecessary renders
      for (const key in errors) {
        form.setError(key, {
          type: 'required',
          message: errors[key],
        })
      }
    }
  }, [errors])

    useEffect(() => {
      const subscription = form.watch((values: Record<string, any>) => {
        values?.filterGroups?.[groupIndex]?.filters?.forEach((filter: any, index: number) => {
          if (required_fields.includes(filter.field) && filter?.[filter.field]) {
            form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.${filter.field}`)
          }
          else {
            if (filter.field) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.field`)
            if (filter.operator) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.operator`)
            if (filter.values && filter.values.length > 0) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.values`)
          }
        })
      })
  
      return () => subscription.unsubscribe()
    }, [form.watch])


  return (
    <div className="space-y-1">
      <div>
        {fields.map((field, index) => {

          const no_group_filter = form.getValues()?.filterGroups?.length == 1
          const default_filter_last_operation = (groupIndex == 0 && fields?.[groupIndex]?.filters?.length - 1 == index && no_group_filter)

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
                  {(((groupIndex == 1 && index == 0)) || (index > 0 && (!default_filter_last_operation))) && field.type === 'operator' &&(
                    <Select
                      // Get the operator from the previous item if it's an operator type
                      disabled={true}
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

                  {required_fields?.includes(field?.field) && (<FormModule
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
                          readonly: true
                        },
                        {
                          id: `${prefix}.operator`,
                          formType: 'select',
                          name: `${prefix}.operator`,
                          placeholder: 'Select an operator',
                          selectSearchable: true,
                          readonly: true
                        },
                        {
                          id: `${prefix}.${field.field}`,
                          formType: field?.field === 'resolution' ? 'combobox' : 'select',
                          name: `${prefix}.${field.field}`,
                          placeholder: 'Select a value',
                          selectSearchable: true,
                          isAlphabetical: false,
                          ...(field?.field === 'resolution' ? {
                            comboboxConfig: {
                              selectOptions: [
                                { label: 'Seconds', value: 's' },
                                { label: 'Minutes', value: 'm' },
                                { label: 'Hours', value: 'h' },
                              ]
                            }
                          } : {})
                        },
                      ] as IField[]
                    }
                    subConfig={{
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
                        [`${prefix}.units`]: [
                          { label: 'Seconds', value: 's' },
                          { label: 'Minutes', value: 'm' },
                          { label: 'Hours', value: 'h' },
                        ],
                        [`${prefix}.time_range`]: [
                          // { label: '30 Days', value: '30d' },
                          { label: '12h', value: '12h' },
                          { label: '1d', value: '1d' },
                          // { label: '7d', value: '7d' },
                        ],
                        // [`${prefix}.Resolution`]:  resolution_options,
                        [`${prefix}.Graph Type`]: [
                          { label: 'Line Chart', value: 'line' },
                          { label: 'Bar Chart', value: 'bar' },
                          { label: 'Area Chart', value: 'area' },
                        ],
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
                  />)
                  }
                  {field.type === 'criteria' && !required_fields?.includes(field?.field) && (
                  <>
                    <FormModule
                      fields={[
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
                        {
                          id: `${prefix}.values`,
                          formType: 'multi-select',
                          name: `${prefix}.values`,
                          placeholder: 'Enter the value',
                          multiSelectEnableCreate: true,
                          multiSelectShowCreatableItem: false,
                          multiSelectUseStringValues: true,
                        }
                      ]}
                      form={form}
                      formKey="filters"
                      formSchema={ZodSchema}
                      subConfig={{
                        selectOptions: {
                          [`${prefix}.field`]:
                            columns?.map(column => ({
                              label: column.label,
                              value: column.accessorKey,
                            })) || [],
                          [`${prefix}.operator`]: OPERATORS,
                        },
                      }}
                    />

                    {hasManyFilters && (
                      <Button
                        variant = "ghost"
                        onClick = { () => onRemoveFilter(criteriaIndex) }
                      >
                        <MinusCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </>
                )}
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
      searchConfig,
      fieldConfig,
    });

    return response;
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return []; // Return empty array on error
  }
};
