import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { type z } from 'zod'

import { useManageFilter } from '../../../Provider'
import { ZodSchema } from '../../schemas/filter'

const useFilterContentActions = (filter_type: string) => {
  const { actions, state } = useManageFilter()
  const { handleUpdateFilter } = actions
  const { filterDetails } = state ?? {}
  

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
    }, {
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
    },
  ]

  const default_filters = (type: string) => {
    if (type === 'timeline_filter') return _def_filters

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
    ]
  }

  
  // Convert existing filters to the new group structure if needed
  const initialFilterGroups = useMemo(() => {
    return (
      filterDetails.filterGroups
      ||
      [
        {
          id: '1',
          groupOperator: 'and',
          filters: default_filters(filter_type),
        },
      ]
    )
  }, [filterDetails])
  
  const form = useForm<z.infer<typeof ZodSchema>>({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      filterGroups: initialFilterGroups,
    },
  })


  const {
    fields: filterGroups,
    append: appendGroup,
    remove: removeGroup,
    move: moveGroup,
  } = useFieldArray({
    control: form.control,
    name: 'filterGroups',
  })
  

  // Watch for changes and update filter
  form.watch((data: any, {name}) => {
    if (data.filterGroups) {
      // Check if the changed field is either 'field' or 'operator'
      // if (name?.includes('.field') || name?.includes('.operator')) {
      //   const [_, groupIndex, __, filterIndex] = name?.split('.') || [];

      //   // Reset the values field for the corresponding filter
      //   // if (groupIndex && filterIndex) {
      //   //   form.setValue(`filterGroups.${Number(groupIndex)}.filters.${Number(filterIndex)}.values`, []);
      //   // }
      // }

      handleUpdateFilter({ filterGroups: data.filterGroups })
    }
  })

  // Add Filter Group function
  const handleAddFilterGroup = () => {
    // Clone the current state of filterGroups
    const currentValues = [...(form.getValues('filterGroups') || [])]
    // Append a new group
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
    })

    
  }

  // Remove Filter Group function
  const handleRemoveFilterGroup = (index: number) => {
    if (filterGroups.length > 1) {
      removeGroup(index)
    }
  }

  // Move Filter Group function
  const handleFilterGroupMove = (activeIndex: number, overIndex: number) => {
    moveGroup(activeIndex, overIndex)
  }

  // Update Group Operator function
  const handleUpdateGroupOperator = (index: number, operator: 'and' | 'or') => {
    const updatedGroups = [...form.getValues().filterGroups]
    if (updatedGroups[index]) {
      updatedGroups[index].groupOperator = operator
    }
    form.setValue('filterGroups', updatedGroups)
  }

  // Add Filter function - moved from FilterGroupActions
  const handleAppendFilter = (groupIndex: number) => {
    
    const currentFilters = form.getValues(`filterGroups.${groupIndex}.filters`)
    const updatedFilters = [...(currentFilters || [])]

    // Check if the last item is not an operator before adding a new one
    const lastItem = updatedFilters[updatedFilters.length - 1]
    if (updatedFilters.length > 0 && lastItem?.type !== 'operator') {
      updatedFilters.push({
        operator: 'and',
        type: 'operator',
        default: true,
      })
    }

    // Add the new filter
    updatedFilters.push({
      field: '',
      operator: 'equal',
      label: '',
      values: [],
      type: 'criteria',
      default: true,
    })

    form.setValue(`filterGroups.${groupIndex}.filters`, updatedFilters)
    form.trigger(`filterGroups.${groupIndex}.filters`)
  }

  const handleRemoveFilter = (groupIndex: number, filterIndex: number) => {
    // Get all filters in the group
    const groupFilters = [
      ...(form.getValues().filterGroups[groupIndex]?.filters || []),
    ]

    // Get all criteria filters (non-operator filters)
    const criteriaFilters = groupFilters.filter(
      filter => filter.type === 'criteria',
    )

    // Get the criteria filter we want to remove
    const targetFilter = criteriaFilters[filterIndex]

    if (targetFilter) {
      // Find the actual index of this filter in the full array (including operators)
      const actualIndex = groupFilters.findIndex(
        filter => filter === targetFilter,
      )

      if (actualIndex !== -1) {
        // Handle operator removal logic
        if (groupFilters[actualIndex + 1]?.type === 'operator') {
          groupFilters.splice(actualIndex, 2) // Remove filter + next operator
        }
        else if (
          actualIndex > 0
          && groupFilters[actualIndex - 1]?.type === 'operator'
        ) {
          groupFilters.splice(actualIndex - 1, 2) // Remove previous operator + filter
        }
        else {
          groupFilters.splice(actualIndex, 1) // Remove only the filter
        }

        // Update filters properly using form's update method
        form.setValue(`filterGroups.${groupIndex}.filters`, groupFilters)
        form.trigger(`filterGroups.${groupIndex}.filters`)
      }
    }
  }

  const handleUpdateJunctionOperator = (
    groupIndex: number,
    index: number,
    operator: string,
  ) => {
    const updatedFilters = [
      ...(form.getValues().filterGroups[groupIndex]?.filters || []),
    ]
    // Make sure we're updating an operator type
    if (updatedFilters[index] && updatedFilters[index].type === 'operator') {
      updatedFilters[index].operator = operator as 'and' | 'or'
      form.setValue(`filterGroups.${groupIndex}.filters`, updatedFilters)
    }
  }

  
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

export default useFilterContentActions
