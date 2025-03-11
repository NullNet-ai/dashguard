'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { MinusCircle, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useManageFilter } from '../Provider';
import { cn } from '~/lib/utils';
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '~/components/ui/sortable';
import { GripVerticalIcon } from 'lucide-react';
import { useMemo } from 'react';

const OPERATORS = [
  { value: 'equal', label: 'Equals' },
  { value: 'not_equal', label: 'Not Equal' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'greater_than_or_equal', label: 'Greater Than Or Equal' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'less_than_or_equal', label: 'Less Than Or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'is_null', label: 'Is Null' },
  { value: 'is_not_null', label: 'Is Not Null' },
  { value: 'is_between', label: 'Is Between' },
  { value: 'is_not_between', label: 'Is Not Between' },
  { value: 'like', label: 'Like' },
];

// Updated schema to support filter groups
// Update the schema to better handle the filter values
const FilterCriteriaSchema = z.object({
  field: z.string(),
  operator: z.string(),
  label: z.string(),
  values: z.union([z.string(), z.array(z.string()), z.undefined()]),
  type: z.literal('criteria'),
  default: z.boolean(),
});

const FilterOperatorSchema = z.object({
  operator: z.enum(['and', 'or']),
  type: z.literal('operator'),
  default: z.boolean(),
});

const FilterItemSchema = z.discriminatedUnion('type', [
  FilterCriteriaSchema,
  FilterOperatorSchema,
]);

const ZodSchema = z.object({
  filterGroups: z.array(
    z.object({
      id: z.string(),
      groupOperator: z.enum(['and', 'or']).default('and'),
      filters: z.array(FilterItemSchema),
    })
  ),
});

export default function FilterContent() {
  const { actions, state } = useManageFilter();
  const { handleUpdateFilter } = actions;
  const { filterDetails, columns } = state ?? {};

  // Convert existing filters to the new group structure if needed
  const initialFilterGroups = useMemo(() => {
    return filterDetails.filter_groups || [{
      id: '1',
      groupOperator: 'and',
      filters: [{
        field: '', 
        operator: '',
        label: '',
        values: [],
        type: 'criteria',
        default: true,
      }]
    }]
  }, [filterDetails]);

  const form = useForm<z.infer<typeof ZodSchema>>({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      filterGroups: initialFilterGroups as unknown as z.infer<typeof ZodSchema>["filterGroups"],
    },
  });

  const { fields: filterGroups, append: appendGroup, remove: removeGroup, move: moveGroup } = useFieldArray({
    control: form.control,
    name: 'filterGroups',
  });

  // Watch for changes and update filter
  form.watch((data) => {
    if (data.filterGroups) {
      handleUpdateFilter({ filter_groups: data.filterGroups });
    }
  });

  // Add Filter Group function
  const handleAddFilterGroup = () => {
    appendGroup({
      id: String(Date.now()),
      groupOperator: 'and',
      filters: [{
        field: '',
        operator: 'equal',
        label: '',
        values: [],
        type: 'criteria',
        default: true,
      }]
    });
  };

  // Remove Filter Group function
  const handleRemoveFilterGroup = (index: number) => {
    if (filterGroups.length > 1) {
      removeGroup(index);
    }
  };

  // Move Filter Group function
  const handleFilterGroupMove = (activeIndex: number, overIndex: number) => {
    moveGroup(activeIndex, overIndex);
  };

  // Update Group Operator function
  const handleUpdateGroupOperator = (index: number, operator: 'and' | 'or') => {
    const updatedGroups = [...form.getValues().filterGroups];
    if (updatedGroups[index]) {
      updatedGroups[index].groupOperator = operator;
    }
    form.setValue('filterGroups', updatedGroups);
  };

  // Add Filter function - moved from FilterGroupActions
  const handleAppendFilter = (groupIndex: number) => {
    const currentFilters = form.getValues(`filterGroups.${groupIndex}.filters`);
    const updatedFilters = [...(currentFilters || [])];

    // Check if the last item is not an operator before adding a new one
    const lastItem = updatedFilters[updatedFilters.length - 1];
    if (updatedFilters.length > 0 && lastItem?.type !== 'operator') {
      updatedFilters.push({
        operator: 'and',
        type: 'operator',
        default: true,
      });
    }

    // Add the new filter
    updatedFilters.push({
      field: '',
      operator: 'equal',
      label: '',
      values: [],
      type: 'criteria',
      default: false,
    });

    form.setValue(`filterGroups.${groupIndex}.filters`, updatedFilters);
    form.trigger(`filterGroups.${groupIndex}.filters`);
  };

  const handleRemoveFilter = (groupIndex: number, filterIndex: number) => {
    // Get all filters in the group
    const groupFilters = [...form.getValues().filterGroups[groupIndex]?.filters || []];
    
    // Get all criteria filters (non-operator filters)
    const criteriaFilters = groupFilters.filter(filter => filter.type === 'criteria');
    
    // Get the criteria filter we want to remove
    const targetFilter = criteriaFilters[filterIndex];
    
    if (targetFilter) {
      // Find the actual index of this filter in the full array (including operators)
      const actualIndex = groupFilters.findIndex(filter => filter === targetFilter);
      
      if (actualIndex !== -1) {
        // Handle operator removal logic
        if (groupFilters[actualIndex + 1]?.type === 'operator') {
          groupFilters.splice(actualIndex, 2); // Remove filter + next operator
        } else if (actualIndex > 0 && groupFilters[actualIndex - 1]?.type === 'operator') {
          groupFilters.splice(actualIndex - 1, 2); // Remove previous operator + filter
        } else {
          groupFilters.splice(actualIndex, 1); // Remove only the filter
        }
        
        // Update filters properly using form's update method
        form.setValue(`filterGroups.${groupIndex}.filters`, groupFilters);
        form.trigger(`filterGroups.${groupIndex}.filters`);
      }
    }
  };
  

  // Update Junction Operator function - moved from FilterGroup
  const handleUpdateJunctionOperator = (groupIndex: number, index: number, operator: string) => {
    const updatedFilters = [...(form.getValues().filterGroups[groupIndex]?.filters || [])];
    // Make sure we're updating an operator type
    if (updatedFilters[index] && updatedFilters[index].type === 'operator') {
      updatedFilters[index].operator = operator as 'and' | 'or';
      form.setValue(`filterGroups.${groupIndex}.filters`, updatedFilters);
    }
  };

  return (
    <div className="mt-5 space-y-1 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
      <Form {...form}>
        <Sortable
          value={filterGroups.map((group) => ({ ...group, id: group.id }))}
          onMove={({ activeIndex, overIndex }) => {
            handleFilterGroupMove(activeIndex, overIndex);
          }}
        >
          {filterGroups.map((group, groupIndex) => {
            return (
              <SortableItem value={group.id} key={group.id} id={String(groupIndex)}>
                <div className="mb-1 rounded-lg border border-gray-100 bg-[#F8FAFC] overflow-hidden">
                  <div className="flex">
                    {/* Only show drag handle if there's more than one group */}
                    {filterGroups.length > 1 && (
                      <div className="flex items-stretch w-[30px]">
                        <SortableDragHandle
                          variant="ghost"
                          size="icon"
                          className="h-full flex items-center text-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-400"
                        >
                          <GripVerticalIcon className="h-full" aria-hidden="true" />
                        </SortableDragHandle>
                      </div>
                    )}

                    {/* Main content area */}
                    <div className="flex-1 p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {groupIndex > 0 && (
                            <Select
                              value={group.groupOperator}
                              onValueChange={(value: 'and' | 'or') =>
                                handleUpdateGroupOperator(groupIndex, value)
                              }
                            >
                              <SelectTrigger className="w-fit h-8 border-gray-200 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="and">AND</SelectItem>
                                <SelectItem value="or">OR</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Add Filter button with simplified props */}
                          <FilterGroupActions
                            onAppendFilter={() => handleAppendFilter(groupIndex)}
                          />

                          {filterGroups.length > 1 && (
                            <Button
                              onClick={() => handleRemoveFilterGroup(groupIndex)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Individual filter group content with simplified props */}
                      <FilterGroup
                        groupIndex={groupIndex}
                        form={form}
                        fields={form.control._formValues.filterGroups[groupIndex]?.filters || []}
                        columns={(columns || []) as Array<{ label: string; accessorKey: string; }>}
                        onRemoveFilter={(index) => handleRemoveFilter(groupIndex, index)}
                        onUpdateJunctionOperator={(index, operator) => 
                          handleUpdateJunctionOperator(groupIndex, index, operator)}
                      />
                    </div>
                  </div>
                </div>
              </SortableItem>
            );
          })}
        </Sortable>
      </Form>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleAddFilterGroup}
        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        Add Group Filter
      </Button>
    </div>
  );
}

// Simplified component for the Add Filter button
function FilterGroupActions({ onAppendFilter }: { onAppendFilter: () => void }) {
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
function FilterGroup({
  groupIndex,
  form,
  fields,
  columns,
  onRemoveFilter,
  onUpdateJunctionOperator
}: {
  groupIndex: number;
  form: any;
  fields: any[];
  columns: Array<{
    label: string;
    accessorKey: string;
  }>;
  onRemoveFilter: (index: number) => void;
  onUpdateJunctionOperator: (index: number, operator: string) => void;
}) {
  // Calculate the number of criteria filters to determine when to show delete button
  const criteriaFilters = fields.filter(filter => filter.type === 'criteria');
  const hasManyFilters = criteriaFilters.length > 1;
  
  return (
    <div className="space-y-1">
      <div>
        {fields.map((field, index) => {
          const prefix = `filterGroups.${groupIndex}.filters.${index}`;
          const filterData = form.getValues().filterGroups[groupIndex]?.filters[index];

          if (!filterData) return null;

          // Calculate the criteria index for this filter (for delete operation)
          const criteriaIndex = fields
            .slice(0, index + 1)
            .filter(f => f.type === 'criteria')
            .length - 1;

          return (
            <div key={field.id || index} className="">
                {filterData.type !== 'operator' && <div className={cn("grid items-end gap-1",
                  index === 0 
                    ? "grid-cols-[1fr_1fr_2fr_auto]" 
                    : "grid-cols-[auto_1fr_1fr_2fr_auto]"
                )}>
                  {index > 0 && (
                    <Select
                      // Get the operator from the previous item if it's an operator type
                      value={fields[index - 1]?.type === 'operator' ? fields[index - 1].operator : 'and'}
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
                    fields={[
                      {
                        id: `${prefix}.field`,
                        formType: 'select',
                        name: `${prefix}.field`,
                        placeholder: 'Select a Field',
                        selectSearchable: true
                      },
                      {
                        id: `${prefix}.operator`,
                        formType: 'select',
                        name: `${prefix}.operator`,
                        placeholder: 'Select an operator',
                        selectSearchable: true
                      },
                      {
                        id: `${prefix}.values`,
                        formType: 'multi-select',
                        name: `${prefix}.values`,
                        placeholder: 'Enter the value',
                        multiSelectEnableCreate: true,
                        multiSelectShowCreatableItem: false,
                        multiSelectUseStringValues: true
                      },
                    ]}
                    subConfig={{
                      selectOptions: {
                        [`${prefix}.field`]:
                          columns?.map((column) => ({
                            label: column.label,
                            value: column.accessorKey,
                          })) || [],
                        [`${prefix}.operator`]: OPERATORS,
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
                </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
