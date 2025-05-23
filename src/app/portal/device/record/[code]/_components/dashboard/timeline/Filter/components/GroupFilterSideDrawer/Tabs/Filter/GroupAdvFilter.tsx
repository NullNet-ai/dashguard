'use client'
import { GripVerticalIcon, Trash2 } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  SortableDragHandle,
} from '~/components/ui/sortable'

import { FilterGroup } from '../functions'
import FilterGroupActions from '../functions/FilterGroupActions'

import GroupAdvOperator from './Operator'

interface IProps {
  group: {
    groupOperator: 'and' | 'or'
  }
  groupIndex: number
  handleUpdateGroupOperator: (index: number, value: 'and' | 'or') => void
  handleRemoveFilterGroup: (index: number) => void
  handleRemoveFilter: (groupIndex: number, filterIndex: number) => void
  handleUpdateJunctionOperator: (groupIndex: number, filterIndex: number, operator: 'and' | 'or') => void
  filterGroupLength: number
  form: any
  filter_type: string
  handleAppendFilter: (groupIndex: number) => void
}

export default function GroupAdvFilter({ group, groupIndex, handleUpdateGroupOperator, handleRemoveFilter, handleRemoveFilterGroup, handleUpdateJunctionOperator, form, filter_type, handleAppendFilter }: IProps) {
  return (
    <div className="mb-1 overflow-hidden rounded-lg border border-gray-100 bg-[#F8FAFC]">
      <div className="flex">
        {groupIndex !== 0 && (
          <div className="flex w-[30px] items-stretch">
            <SortableDragHandle
              className = "flex h-full items-center bg-indigo-50 text-indigo-300 hover:bg-indigo-100 hover:text-indigo-400"
              size = "icon"
              variant = "ghost"
            >
              <GripVerticalIcon
                aria-hidden = "true"
                className = "h-full"
              />
            </SortableDragHandle>
          </div>
        )}

        <div className="flex-1 p-1.5 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(groupIndex > 1) && (
                <GroupAdvOperator group={group} groupIndex={groupIndex} handleUpdateGroupOperator={handleUpdateGroupOperator} />
              )}
            </div>

            <div className="flex items-center gap-2">

              {groupIndex > 0 && (
                <>
                  <FilterGroupActions
                    onAppendFilter={() => handleAppendFilter(groupIndex) }
                  />
                  <Button
                    size = "sm"
                    variant = "ghost"
                    onClick = { () => handleRemoveFilterGroup(groupIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <FilterGroup
            filter_type={ filter_type }
            form={ form }
            groupIndex={ groupIndex }
            onRemoveFilter = { (index) => handleRemoveFilter(groupIndex, index) }

            onUpdateJunctionOperator= {
              handleUpdateJunctionOperator as any
            }

          />
        </div>
      </div>
    </div>
  )
}
