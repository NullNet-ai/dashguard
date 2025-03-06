'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleMinus, Plus, GripVerticalIcon } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

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

interface SortItem {
  id?: string
  value: string
  desc: boolean | undefined
}

const ZodSchema = z.object({
  sorts: z.array(
    z.object({
      desc: z.boolean(),
      value: z.string().min(1, 'Field is required'),
    }),
  ),
})

export default function SortContent() {
  const { actions, state } = useManageFilter()
  const { columns } = state ?? {}
  const { handleUpdateFilter } = actions

  const form = useForm<{ sorts: SortItem[] }>({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      sorts: state?.filterDetails?.sorts?.map((sort: any) => ({
        id: sort.id,
        value: sort.id, // Use the same value as id
        desc: sort.desc,
      })) ?? [
        {
          id: '',
          value: '',
          desc: undefined,
        },
      ],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'sorts',
  })

  const handleAddSort = () => {
    const newSort = { id: '', value: '', desc: undefined }
    append(newSort)
    handleUpdateFilter({
      sorts: [...fields, newSort],
    })
  }

  const handleSortChange = (
    index: number,
    field: keyof SortItem,
    value: any,
  ) => {
    const updatedSorts = [...fields]
    if (field === 'value') {
      // Update both id and value when value changes
      updatedSorts[index] = {
        ...updatedSorts[index]!,
        id: value,
        value,
      }
    }
    else {
      updatedSorts[index] = {
        ...updatedSorts[index]!,
        [field]: field === 'desc' ? value === 'desc' : value,
      }
    }
    form.setValue('sorts', updatedSorts)
    handleUpdateFilter({ sorts: updatedSorts })
  }

  const handleSortRemove = (index: number) => {
    const updatedSorts = fields.filter((_, i) => i !== index)
    remove(index)
    handleUpdateFilter({ sorts: updatedSorts })
  }

  const handleSortMove = (activeIndex: number, overIndex: number) => {
    move(activeIndex, overIndex)
    const updatedSorts = [...fields]
    const [movedItem] = updatedSorts.splice(activeIndex, 1)
    updatedSorts.splice(overIndex, 0, movedItem!)
    handleUpdateFilter({ sorts: updatedSorts })
  }

  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="grid gap-3">
        <Sortable
          value={fields}
          onMove={({ activeIndex, overIndex }) => {
            handleSortMove(activeIndex, overIndex)
          } }
        >
          {fields.map((sort, index) => (
            <SortableItem id = { String(index) } key = { index } value = { sort.id }>
              <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                <SortableDragHandle
                  className = "size-4 shrink-0 text-gray-400"
                  size = "icon"
                  variant = "ghost"
                >
                  <GripVerticalIcon aria-hidden = "true" className = "size-4" />
                </SortableDragHandle>

                <Select
                  value={sort.value}
                  onValueChange={(value) => handleSortChange(index, 'value', value) }
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select a Field" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {columns?.map((column: any, columnIndex: number) => (
                      <SelectItem key={columnIndex} value={column.accessorKey}>
                        {column.header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                // if undefined it must be the placeholder
                  value={sort.desc === undefined
                    ? ''
                    : sort.desc
                      ? 'desc'
                      : 'asc'}

                  onValueChange={(value) => handleSortChange(index, 'desc', value) }
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select a Sort Order" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>

                {fields.length > 1 && (
                  <Button
                    className = "ms-2"
                    Icon = { CircleMinus }
                    iconClassName = "text-red-600 h-4 w-4"
                    iconPlacement = "left"
                    variant = { 'ghost' }
                    onClick = { () => handleSortRemove(index) }
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
        onClick = { handleAddSort }
      >
        <Plus className="h-4 w-4" />
        Add Sort
      </Button>
    </div>
  )
}
