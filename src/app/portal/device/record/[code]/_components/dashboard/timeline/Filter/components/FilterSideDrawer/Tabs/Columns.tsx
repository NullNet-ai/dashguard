import { GripVerticalIcon, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '~/components/ui/sortable'
import { Switch } from '~/components/ui/switch'

import { useManageFilter } from '../Provider'

interface Column {
  id?: string
  header?: string
  accessorKey?: string
  isShow?: boolean
  icon?: string
  order?: number
  label?: string
}

interface ColumnFormValues {
  columns: Column[]
}

export default function ColumnContent() {
  const { actions, state } = useManageFilter()
  const { handleUpdateFilter } = actions
  const { columns } = state ?? {}

  const form = useForm<ColumnFormValues>({
    defaultValues: {
      columns,
    },
  })

  const [searchQuery, setSearchQuery] = useState('')
  const { fields, move, update } = useFieldArray<ColumnFormValues>({
    control: form.control,
    name: 'columns',
  })

  const filteredColumns = useMemo(() => {
    return fields.filter(column => column.label?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [fields, searchQuery])

  const handleToggle = (index: number, id: string) => {
    const columnToUpdate = fields?.find(column => column.id === id)
    const updatedColumn = {
      ...(columnToUpdate ?? {
        isShow: false,
        order: 0,
        label: '',
        id: '',
      }),
      isShow: !columnToUpdate?.isShow,
    }
    update(index, updatedColumn)

    const updated_fields = fields?.map((column) => {
      if (column.id === id) {
        return {
          ...column,
          isShow: updatedColumn.isShow,
        }
      }
      return column
    })
    handleUpdateFilter({
      columns: updated_fields,
    })
  }

  const handleColumnMove = (activeIndex: number, overIndex: number) => {
    move(activeIndex, overIndex)
    const updatedColumns = [...fields]
    const [movedItem] = updatedColumns.splice(activeIndex, 1)
    if (movedItem) {
      updatedColumns.splice(overIndex, 0, movedItem)
    }

    const updated_fields = updatedColumns.map((column, index) => ({
      ...column,
      order: index,
    }))
    handleUpdateFilter({
      columns: updated_fields,
    })
  }

  return (
    <div className="space-y-4 ">
      <div className="relative my-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          className = "w-full rounded-md border py-2 pl-8 pr-4 text-sm"
          placeholder = "Search columns..."
          type = "text"
          value = { searchQuery }
          onChange = { (e) => setSearchQuery(e.target.value) }
        />
      </div>
      <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-2">

        <Sortable
          value={filteredColumns}
          onMove={({ activeIndex, overIndex }) => {
            handleColumnMove(activeIndex, overIndex)
          } }
        >
          {filteredColumns.map((column, index) => (
            <SortableItem id = { column.id } key = { column.id } value = { column.id }>
              <div className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <SortableDragHandle
                    className = "mb-1 size-4 shrink-0 text-muted-foreground"
                    size = "icon"
                    variant = "ghost"
                  >
                    <GripVerticalIcon aria-hidden = "true" className = "size-6" />
                  </SortableDragHandle>
                  <span className="text-sm text-muted-foreground">
                    {column.label}
                  </span>
                </div>
                <Switch
                  checked = { column.isShow }
                  size = "sm"
                  onCheckedChange = { () => handleToggle(index, column.id) }
                />
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>
    </div>
  )
}
