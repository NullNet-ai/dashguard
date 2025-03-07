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
import { useManageFilter } from '../Provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface SortItem {
  id?: string;
  value: string;
  desc: boolean | undefined;
}

const ZodSchema = z.object({
  sorts: z.array(
    z.object({
      desc: z.boolean(),
      value : z.string().min(1, 'Field is required'),
    }),
  ),
});

export default function SortContent() {
  const { actions, state } = useManageFilter();
  const { columns } = state ?? {};
  const { handleUpdateFilter } = actions;

  const form = useForm<{ sorts: SortItem[] }>({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      sorts: state?.filterDetails?.sorts?.map((sort: any) => ({
        id: sort.id,
        value: sort.value || sort.id,
        desc: sort.desc,
      })) ?? [
        {
          id: '',
          value: '',
          desc: undefined
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'sorts',
  });

  const handleAddSort = () => {
    const newSort = { id: '', value: '', desc: undefined };
    append(newSort);
    handleUpdateFilter({
      sorts: [...fields, newSort],
    });
  };

  const handleSortChange = (
    index: number,
    field: keyof SortItem,
    value: any,
  ) => {
    const updatedSorts = [...fields];
    if (field === 'value') {
      // Update both id and value when value changes
      updatedSorts[index] = {
        ...updatedSorts[index]!,
        id: value,
        value: value,
      };
    } else {
      updatedSorts[index] = {
        ...updatedSorts[index]!,
        [field]: field === 'desc' ? value === 'desc' : value,
      };
    }
    form.setValue('sorts', updatedSorts);
    handleUpdateFilter({ sorts: updatedSorts });
  };

  const handleSortRemove = (index: number) => {
    const updatedSorts = fields.filter((_, i) => i !== index);
    remove(index);
    handleUpdateFilter({ sorts: updatedSorts });
  };

  const handleSortMove = (activeIndex: number, overIndex: number) => {
    move(activeIndex, overIndex);
    const updatedSorts = [...fields];
    const [movedItem] = updatedSorts.splice(activeIndex, 1);
    updatedSorts.splice(overIndex, 0, movedItem!);
    handleUpdateFilter({ sorts: updatedSorts });
  };

  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="grid gap-3">
        <Sortable
          value={fields}
          onMove={({ activeIndex, overIndex }) => {
            handleSortMove(activeIndex, overIndex);
          }}
        >
          {fields.map((sort, index) => (
            <SortableItem value={sort.id} key={index} id={String(index)}>
              <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                <SortableDragHandle
                  variant="ghost"
                  size="icon"
                  className="size-4 shrink-0 text-gray-400"
                >
                  <GripVerticalIcon className="size-4" aria-hidden="true" />
                </SortableDragHandle>

                <Select
                  value={sort.value}
                  onValueChange={(value) =>
                    handleSortChange(index, 'value', value)
                  }
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select a Field" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {columns?.map((column: any, index) => (
                      <SelectItem value={column.accessorKey} key={index}>
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

                  onValueChange={(value) =>
                    handleSortChange(index, 'desc', value)
                  }
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
