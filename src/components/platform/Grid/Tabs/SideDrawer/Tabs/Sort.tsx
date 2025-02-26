'use client';

import { CircleMinus, Plus } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '~/components/ui/button';
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
import { GripVerticalIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useManageFilter } from '../Provider';

interface SortItem {
  id: string;
  field: string;
  label: string;
  order: 'asc' | 'desc';
}

export default function SortContent() {
  const { actions, state } = useManageFilter()
  const { columns } = state ?? {}
  const { handleUpdateFilter } = actions;
  
  const form = useForm<{ sorts: SortItem[] }>({
    defaultValues: {
      sorts: state?.filterDetails?.sorts ?? [
        {
          id: '1',
          field: '',
          label: '',
          order: 'asc',
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'sorts',
  });

  const handleAddSort = () => {
    const newSort = { id: String(fields.length + 1), field: '', label: '', order: 'asc' };
    append(newSort);
    handleUpdateFilter({ 
      sorts: [...fields, newSort].map(({ field, order, label }) => ({ field, order, label }))
    });
  };

  const handleSortChange = (index: number, field: keyof SortItem, value: string) => {
    const updatedSorts = [...fields];
    if (field === 'field') {
      const header = columns?.find((col: any) => col.accessorKey === value)?.header || value;
      updatedSorts[index] = {
        ...updatedSorts[index]!,
        field: value,
        label: header
      };
    } else {
      updatedSorts[index] = {
        ...updatedSorts[index]!,
        [field]: value
      };
    }
    form.setValue('sorts', updatedSorts);
    handleUpdateFilter({ 
      sorts: updatedSorts.map(({ field, order, label }) => ({ field, order, label }))
    });
  };

  const handleSortRemove = (index: number) => {
    const updatedSorts = fields.filter((_, i) => i !== index);
    remove(index);
    handleUpdateFilter({ 
      sorts: updatedSorts.map(({ field, order, label }) => ({ field, order, label }))
    });
  };

  const handleSortMove = (activeIndex: number, overIndex: number) => {
    move(activeIndex, overIndex);
    const updatedSorts = [...fields];
    const [movedItem] = updatedSorts.splice(activeIndex, 1);
    updatedSorts.splice(overIndex, 0, movedItem!);
    handleUpdateFilter({ 
      sorts: updatedSorts.map(({ field, order, label }) => ({ field, order, label }))
    });
  };




  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="grid gap-3">
        <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center text-sm font-medium text-gray-500">
          <div></div>
          <div>Field</div>
          <div>Order</div>
        </div>

        <Sortable
          value={fields}
          onMove={({ activeIndex, overIndex }) => {
            handleSortMove(activeIndex, overIndex);
          }}
        >
          {fields.map((sort, index) => (
            <SortableItem value={sort.id} key={sort.id} id={sort.id}>
              <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                <SortableDragHandle
                  variant="ghost"
                  size="icon"
                  className="size-4 shrink-0 text-gray-400"
                >
                  <GripVerticalIcon className="size-4" aria-hidden="true" />
                </SortableDragHandle>

                <Select
                  value={sort.field}
                  onValueChange={(value) => handleSortChange(index, 'field', value)}
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select Field" />
                  </SelectTrigger>
                  <SelectContent className='z-[9999]'>
                    {columns?.map((column : any, index : number) => (
                      <SelectItem key={index} value={column.accessorKey}>
                        {column.header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sort.order}
                  onValueChange={(value) => handleSortChange(index, 'order', value)}
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select Order" />
                  </SelectTrigger>
                  <SelectContent className='z-[9999]'>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>

                {fields.length > 1 && (
                  <Button
                  onClick={() => handleSortRemove(index)}
                  Icon={CircleMinus}
                  iconPlacement="left"
                  iconClassName="text-red-600 h-4 w-4"
                  className="ms-2"
                  variant={'ghost'}
                />
                )}
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleAddSort}
        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        Add Sort
      </Button>
    </div>
  );
}
