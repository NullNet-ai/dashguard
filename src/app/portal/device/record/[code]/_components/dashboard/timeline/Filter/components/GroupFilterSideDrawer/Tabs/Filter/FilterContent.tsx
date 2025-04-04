'use client'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import {
  Sortable,
  SortableItem,
} from '~/components/ui/sortable'

import useFilterContentActions from './customHooks/useFIlterContent'
import GroupAdvFilter from './GroupAdvFilter'

export default function FilterContent({ filter_type }: { filter_type: string }) {
  const {
    form,
    filterGroups,
    handleAddFilterGroup,
    handleRemoveFilterGroup,
    handleFilterGroupMove,
    handleUpdateGroupOperator,
    handleAppendFilter,
    handleRemoveFilter,
    handleUpdateJunctionOperator,
  } = useFilterContentActions(filter_type)

  const { default_group_item, rest_group_items } = useMemo(() => {
    if (!filterGroups || filterGroups.length === 0) {
      return { default_group_item: null, rest_group_items: [] }
    }

    return {
      default_group_item: filterGroups[0],
      rest_group_items: filterGroups.slice(1),
    }
  }, [filterGroups])

  return (
    <div className="mt-3 max-h-[70vh] space-y-1 overflow-y-auto rounded-lg">
      <Form {...form}>
        <GroupAdvFilter
          filter_type = { filter_type }
          filterGroupLength = { filterGroups?.length }
          form = { form }
          group = { default_group_item as { groupOperator: 'and' | 'or' } }
          groupIndex = { 0 }
          handleAppendFilter = { handleAppendFilter }
          handleRemoveFilter = { handleRemoveFilter }
          handleRemoveFilterGroup = { handleRemoveFilterGroup }
          handleUpdateGroupOperator = { handleUpdateGroupOperator }
          handleUpdateJunctionOperator = { handleUpdateJunctionOperator }
        />
        <Sortable
          value={rest_group_items.map(group => ({ ...group, id: group.id }))}
          onMove={({ activeIndex, overIndex }) => {
            handleFilterGroupMove(activeIndex + 1, overIndex + 1)
          } }
        >
          {rest_group_items.map((group, idx) => {
            const groupIndex = idx + 1
            return (
              <SortableItem
                id = { String(groupIndex) }
                key = { group.id }
                value = { group.id }
              >
                <GroupAdvFilter
                  filter_type = { filter_type }
                  filterGroupLength = { filterGroups?.length }
                  form = { form }
                  group = { group }
                  groupIndex = { groupIndex }
                  handleAppendFilter = { handleAppendFilter }
                  handleRemoveFilter = { handleRemoveFilter }
                  handleRemoveFilterGroup = { handleRemoveFilterGroup }
                  handleUpdateGroupOperator = { handleUpdateGroupOperator }
                  handleUpdateJunctionOperator = { handleUpdateJunctionOperator }

                />
              </SortableItem>
            )
          })}
        </Sortable>
      </Form>

      <Button
        className = "flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        size = "sm"
        variant = "ghost"
        onClick = { handleAddFilterGroup }
      >
        <Plus className="h-4 w-4" />
        Add Group Filter
      </Button>
    </div>
  )
}
