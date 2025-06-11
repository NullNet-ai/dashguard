'use client'

import { CircleMinus, GripVerticalIcon, Plus } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import ComingSoon from '~/app/portal/coming-soon/_components/coming_soon'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '~/components/ui/sortable'

import { useManageFilter } from '../Provider'

interface GroupItem {
  id: string
  field: string
  label: string
}

export default function GroupContent() {
  const { actions, state } = useManageFilter()
  const { columns } = state ?? {}
  const { handleUpdateFilter } = actions

  const form = useForm<{ groups: GroupItem[] }>({
    defaultValues: {
      groups: state?.filterDetails?.groups ?? [
        { id: '1', field: '', label: '' },
      ],
    },
  })

  const { fields, append, remove, move, update } = useFieldArray({
    control: form.control,
    name: 'groups',
  })

  const handleAddGroup = () => {
    const newGroup = { id: String(fields.length + 1), field: '', label: '' }
    append(newGroup)
    handleUpdateFilter({
      groups: [...fields, newGroup].map(({ field, label }) => ({ field, label })),
    })
  }

  const handleGroupChange = (
    index: number,
    value: string,
    header: string
  ) => {
    update(index, {
      ...fields[index]!,
      field: value,
      label: header,
    })

    handleUpdateFilter({
      groups: fields.map((item, i) => i === index
        ? { field: value, label: header }
        : { field: item.field, label: item.label }
      ),
    })
  }

  const handleGroupMove = (activeIndex: number, overIndex: number) => {
    move(activeIndex, overIndex)
    const updatedGroups = [...fields]
    const [movedItem] = updatedGroups.splice(activeIndex, 1)
    updatedGroups.splice(overIndex, 0, movedItem!)

    handleUpdateFilter({
      groups: updatedGroups.map(({ field, label }) => ({ field, label })),
    })
  }

  const handleGroupRemove = (index: number) => {
    const updatedGroups = fields.filter((_, i) => i !== index)
    remove(index)
    handleUpdateFilter({
      groups: updatedGroups.map(({ field, label }) => ({ field, label })),
    })
  }

  return <ComingSoon />
  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="grid gap-3">
        <Sortable
          value={fields}
          onMove={({ activeIndex, overIndex }) => {
            handleGroupMove(activeIndex, overIndex)
          } }
        >
          {fields.map((group, index) => (
            <SortableItem id = { group.id } key = { group.id } value = { group.id }>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                <SortableDragHandle
                  className = "size-4 shrink-0 text-gray-400"
                  size = "icon"
                  variant = "ghost"
                >
                  <GripVerticalIcon aria-hidden = "true" className = "size-4" />
                </SortableDragHandle>

                <Select
                  value={group.field}
                  onValueChange={(value) => {
                    const header = columns?.find(
                      (col: any) => col.accessorKey === value
                    )?.header || value
                    handleGroupChange(index, value, header)
                  } }
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select Field" />
                  </SelectTrigger>
                  <SelectContent className='z-[9999]'>
                    {columns?.map((column: any, index: any) => (
                      <SelectItem key={index} value={column.accessorKey}>
                        {column.header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fields.length > 1 && (
                  <Button
                    className = "ms-2"
                    Icon = { CircleMinus }
                    iconClassName = "text-red-600 h-4 w-4"
                    iconPlacement = "left"
                    variant = { 'ghost' }
                    onClick = { () => handleGroupRemove(index) }
                  />
                )}
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>

      <Button
        className = "flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        size = "sm"
        variant = "ghost"
        onClick = { handleAddGroup }
      >
        <Plus className="h-4 w-4" />
        Add Group
      </Button>
    </div>
  )
}
