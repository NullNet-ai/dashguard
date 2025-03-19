'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { GripVerticalIcon, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '~/components/ui/sortable';
import { useManageFilter } from '../Provider';
import { FilterGroup } from './functions';
import { ZodSchema } from './schemas/filter';
import FilterGroupActions from './functions/FilterGroupActions';

export default function SampleFilterContent({filter_type}: {filter_type: string}) {
  const { actions, state } = useManageFilter();
  const { handleUpdateFilter } = actions;
  const { filterDetails, columns, searchConfig } = state ?? {};


  const _def_filters = [
    {
      field: 'Time Range',
      operator: 'equal',
      label: 'Time Range',
      values: [],
      type: 'criteria',
      default: true,
      input_type: 'select',
      static: true,
    },  {
      operator: 'and',
      type: 'operator',
      default: true,
    },
    {
      field: 'Resolution',
      operator: 'equal',
      label: 'Resolution',
      values: [],
      type: 'criteria',
      default: true,
      input_type: 'select',
      static: true,
    },
    {
      operator: 'and',
      type: 'operator',
      default: true,
    }
  ]
  
  const default_filters = (type: string) =>{
    if(type === 'timeline_filter') return _def_filters
    
    return [
  ..._def_filters,
    {
      field: 'Graph Type',
      operator: 'equal',
      label: 'Graph Type',
      values: [],
      type: 'criteria',
      default: true,
      input_type: 'select',
      options: [
        { label: 'Line Chart', value: 'line' },
        { label: 'Bar Chart', value: 'bar' },
        { label: 'Area Chart', value: 'area' },
      ],
      static: true,
    },
    {
      operator: 'and',
      type: 'operator',
      default: true,
    },
  ] }

  // Convert existing filters to the new group structure if needed
  const initialFilterGroups = useMemo(() => {
    return (
      filterDetails.filter_groups || [
        {
          id: '1',
          groupOperator: 'and',
          filters: default_filters(filter_type)
          // filters: [
          //   {
          //     field: '',
          //     operator: '',
          //     label: '',
          //     values: [],
          //     type: 'criteria',
          //     default: true,
          //   },
          // ],
        },
      ]
    );
  }, [filterDetails]);

  
  const form = useForm<z.infer<typeof ZodSchema>>({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      filterGroups: initialFilterGroups as unknown as z.infer<
      typeof ZodSchema
      >['filterGroups'],
    },
  });
  

  const {
    fields: filterGroups,
    append: appendGroup,
    remove: removeGroup,
    move: moveGroup,
  } = useFieldArray({
    control: form.control,
    name: 'filterGroups',
  });
  

  // Watch for changes and update filter
  form.watch((data, { name }) => {
    
    if (data?.filterGroups?.length) {
      // Check if the changed field is either 'field' or 'operator'
      if (name?.includes('.field') || name?.includes('.operator')) {
        const [_, groupIndex, __, filterIndex] = name?.split('.') || [];
        
        
        // Reset the values field for the corresponding filter
        if (groupIndex && filterIndex) {
          form.setValue(`filterGroups.${Number(groupIndex)}.filters.${Number(filterIndex)}.values`, []);
        }
      }
      
      
      handleUpdateFilter({ filter_groups: data.filterGroups });
    }
  });

  // Add Filter Group function
  const handleAddFilterGroup = () => {
    appendGroup({
      id: String(Date.now()),
      groupOperator: 'and',
      filters: [
        {
          field: '',
          operator: 'equal',
          label: '',
          values: [],
          type: 'criteria',
          default: true,
        },
      ],
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
      default: true,
    });

    form.setValue(`filterGroups.${groupIndex}.filters`, updatedFilters);
    form.trigger(`filterGroups.${groupIndex}.filters`);
  };

  const handleRemoveFilter = (groupIndex: number, filterIndex: number) => {
    // Get all filters in the group
    const groupFilters = [
      ...(form.getValues().filterGroups[groupIndex]?.filters || []),
    ];

    // Get all criteria filters (non-operator filters)
    const criteriaFilters = groupFilters.filter(
      (filter) => filter.type === 'criteria',
    );

    // Get the criteria filter we want to remove
    const targetFilter = criteriaFilters[filterIndex];

    if (targetFilter) {
      // Find the actual index of this filter in the full array (including operators)
      const actualIndex = groupFilters.findIndex(
        (filter) => filter === targetFilter,
      );

      if (actualIndex !== -1) {
        // Handle operator removal logic
        if (groupFilters[actualIndex + 1]?.type === 'operator') {
          groupFilters.splice(actualIndex, 2); // Remove filter + next operator
        } else if (
          actualIndex > 0 &&
          groupFilters[actualIndex - 1]?.type === 'operator'
        ) {
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
  const handleUpdateJunctionOperator = (
    groupIndex: number,
    index: number,
    operator: string,
  ) => {
    const updatedFilters = [
      ...(form.getValues().filterGroups[groupIndex]?.filters || []),
    ];
    // Make sure we're updating an operator type
    if (updatedFilters[index] && updatedFilters[index].type === 'operator') {
      updatedFilters[index].operator = operator as 'and' | 'or';
      form.setValue(`filterGroups.${groupIndex}.filters`, updatedFilters);
    }
  };

  return (
    <div className="mt-3 max-h-[70vh] space-y-1 overflow-y-auto rounded-lg">
      <Form {...form}>
        <Sortable
          value={filterGroups.map((group) => ({ ...group, id: group.id }))}
          onMove={({ activeIndex, overIndex }) => {
            handleFilterGroupMove(activeIndex, overIndex);
          }}
        >
          {filterGroups.map((group, groupIndex) => {
            
            return (
              <SortableItem
                value={group.id}
                key={group.id}
                id={String(groupIndex)}
              >
                <div className="mb-1 overflow-hidden rounded-lg border border-gray-100 bg-[#F8FAFC]">
                  <div className="flex">
                    {/* Only show drag handle if there's more than one group */}
                    {filterGroups.length > 1 && (
                      <div className="flex w-[30px] items-stretch">
                        <SortableDragHandle
                          variant="ghost"
                          size="icon"
                          className="flex h-full items-center bg-indigo-50 text-indigo-300 hover:bg-indigo-100 hover:text-indigo-400"
                        >
                          <GripVerticalIcon
                            className="h-full"
                            aria-hidden="true"
                          />
                        </SortableDragHandle>
                      </div>
                    )}

                    {/* Main content area */}
                    <div className="flex-1 p-1.5 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {groupIndex > 0 && (
                            <Select
                              value={group.groupOperator}
                              onValueChange={(value: 'and' | 'or') =>
                                handleUpdateGroupOperator(groupIndex, value)
                              }
                            >
                              <SelectTrigger className="h-8 w-fit border-gray-200 bg-white">
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
                            onAppendFilter={() =>
                              handleAppendFilter(groupIndex)
                            }
                          />

                          {filterGroups.length > 1 && (
                            <Button
                              onClick={() =>
                                handleRemoveFilterGroup(groupIndex)
                              }
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
                        searchConfig={searchConfig}
                        groupIndex={groupIndex}
                        form={form}
                        fields={
                          form.control._formValues.filterGroups[groupIndex]
                            ?.filters || []
                        }
                        columns={
                          (columns || []) as Array<{
                            label: string;
                            accessorKey: string;
                          }>
                        }
                        onRemoveFilter={(index) =>
                          handleRemoveFilter(groupIndex, index)
                        }
                        onUpdateJunctionOperator={(index, operator) =>
                          handleUpdateJunctionOperator(
                            groupIndex,
                            index,
                            operator,
                          )
                        }
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
