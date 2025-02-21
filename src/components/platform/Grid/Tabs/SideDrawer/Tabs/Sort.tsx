'use client';

import { Plus } from 'lucide-react';
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

interface SortItem {
  id: string;
  field: string;
  order: 'asc' | 'desc';
}

export default function SortContent() {
  const form = useForm({
    defaultValues: {
      sorts: [{ id: '1', field: '', order: 'asc' }],
    },
  });

  const { fields, append, move } = useFieldArray({
    control: form.control,
    name: 'sorts',
  });

  const handleAddSort = () => {
    append({ id: String(fields.length + 1), field: '', order: 'asc' });
  };

  const handleSortChange = (
    index: number,
    field: keyof Omit<SortItem, 'id'>,
    value: string,
  ) => {
    const newValue = field === 'order' ? (value as 'asc' | 'desc') : value;
    form.setValue(`sorts.${index}.${field}`, newValue);
  };

  return (
    <div className="mt-5 space-y-4 rounded-lg p-4">
      <Sortable
        value={fields}
        onMove={({ activeIndex, overIndex }) => {
          move(activeIndex, overIndex);
        }}
      >
        {fields.map((sort, index) => (
          <SortableItem value={sort.id} key={sort.id} id={sort.id}>
            <div className="flex items-center gap-2 rounded-lg border bg-white p-3 shadow-sm">
              <SortableDragHandle
                variant="ghost"
                size="icon"
                className="mb-1 size-4 shrink-0 text-muted-foreground"
              >
                <GripVerticalIcon className="size-6" aria-hidden="true" />
              </SortableDragHandle>

              <Select
                value={sort.field}
                onValueChange={(value) =>
                  handleSortChange(index, 'field', value)
                }
              >
                <SelectTrigger className="w-[200px] border-gray-200 bg-white">
                  <SelectValue placeholder="Select a Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created At</SelectItem>
                  <SelectItem value="updated_at">Updated At</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sort.order}
                onValueChange={(value) =>
                  handleSortChange(index, 'order', value)
                }
              >
                <SelectTrigger className="w-[200px] border-gray-200 bg-white">
                  <SelectValue placeholder="Select a Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SortableItem>
        ))}
      </Sortable>

      <div className="flex justify-start">
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
    </div>
  );
}
