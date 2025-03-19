import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useManageFilter } from '../../../Provider';
import { ZodSchema } from './../../schemas/filter';

const useFilterContentActions = () => {

  const { actions, state } = useManageFilter();
  const { handleUpdateFilter } = actions;
  const { filterDetails } = state ?? {};

  // Convert existing filters to the new group structure if needed
  const initialFilterGroups = useMemo(() => {
    return (
      filterDetails.filter_groups || [
        {
          id: '1',
          groupOperator: 'and',
          filters: [
            {
              field: '',
              operator: '',
              label: '',
              values: [],
              type: 'criteria',
              default: true,
            },
          ],
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
    if (data.filterGroups) {
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

  return {
    form,
    filterGroups,
    handleAddFilterGroup,
    handleRemoveFilterGroup,
    handleFilterGroupMove,
    handleUpdateGroupOperator,
    handleAppendFilter,
    handleRemoveFilter,
    handleUpdateJunctionOperator,
  }
}

export default useFilterContentActions;