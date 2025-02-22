'use client';

import { CircleMinus, GripVerticalIcon, Plus } from 'lucide-react';
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
import { useManageFilter } from '../Provider';

interface GroupItem {
  id: string;
  field: string;
  order: 'asc' | 'desc';
}

const FIELDS = [
  {
    label: 'Category',
    id: 'category',
    value: 'category',
  },
  {
    label: 'Status',
    id: 'status',
    value: 'status',
  },
  {
    label: 'Priority',
    id: 'priority',
    value: 'priority',
  },
  {
    label: 'Assignee',
    id: 'assignee',
    value: 'assignee',
  },
] as const;

const ORDERS = [
  {
    label: 'Ascending',
    id: 'asc',
    value: 'asc',
  },
  {
    label: 'Descending',
    id: 'desc',
    value: 'desc',
  },
] as const;

export default function GroupContent() {
  const { actions } = useManageFilter()
  const { handleUpdateFilter } = actions;
  const form = useForm({
    defaultValues: {
      groups: [{ id: '1', field: 'priority', order: 'desc' }],
    },
  });

  const { fields, append, remove, move, replace, update } = useFieldArray({
    control: form.control,
    name: 'groups',
  });
  const handleAddGroup = () => {
    const newGroup = { id: String(fields.length + 1), field: '', order: 'desc' };
    append(newGroup);
    handleUpdateFilter({ groups: [...fields, newGroup] });
  };

  const handleGroupChange = (
    index: number,
    field: keyof Omit<GroupItem, 'id'>,
    value: string,
  ) => {
    const newValue = field === 'order' ? (value as 'asc' | 'desc') : value;
    update(index, {
      ...fields[index]!,
      [field]: newValue,
    });
    handleUpdateFilter({ groups: fields.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    )});
  };

  const handleGroupRemove = (index: number) => {
    remove(index);
    handleUpdateFilter({ groups: fields.filter((_, i) => i !== index) });
  };

  const handleGroupMove = (activeIndex: number, overIndex: number) => {
    move(activeIndex, overIndex);
    const updatedGroups = [...fields];
    const [movedItem] = updatedGroups.splice(activeIndex, 1);
    updatedGroups.splice(overIndex, 0, movedItem!);
    handleUpdateFilter({ groups: updatedGroups });
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
            handleGroupMove(activeIndex, overIndex);
          }}
        >
          {fields.map((group, index) => (
            <SortableItem value={group.id} key={group.id} id={group.id}>
              <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                <SortableDragHandle
                  variant="ghost"
                  size="icon"
                  className="size-4 shrink-0 text-gray-400"
                >
                  <GripVerticalIcon className="size-4" aria-hidden="true" />
                </SortableDragHandle>

                <Select
                  value={group.field}
                  onValueChange={(value) =>
                    handleGroupChange(index, 'field', value)
                  }
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select Field" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {FIELDS.map((field) => (
                      <SelectItem key={field.id} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={group.order}
                  onValueChange={(value) =>
                    handleGroupChange(index, 'order', value)
                  }
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select Order" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {ORDERS.map((order) => (
                      <SelectItem key={order.id} value={order.value}>
                          {order.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fields.length > 1 && (
                  <Button
                  onClick={() => handleGroupRemove(index)}
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
        onClick={handleAddGroup}
        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        Add Group
      </Button>
    </div>
  );
}
