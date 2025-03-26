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
  label: string;
  value: string;
  desc: boolean | undefined;
}

export default function GroupContent() {
  const { actions, state } = useManageFilter();
  const { columns } = state ?? {};
  const { handleUpdateFilter } = actions;

  const form = useForm<{ groups: GroupItem[] }>({
    defaultValues: {
      groups: state?.filterDetails?.groups?.length
        ? state?.filterDetails?.groups
        : [{ id: '1', field: '', label: '', value: '', desc: undefined }],
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control: form.control,
    name: 'groups',
  });

  const handleAddGroup = () => {
    const newGroup = {
      id: String(fields.length + 1),
      field: '',
      label: '',
      value: '',
      desc: undefined,
    };
    append(newGroup);
    handleUpdateFilter({
      groups: [...fields, newGroup].map(({ field, label, value, desc }) => ({
        field,
        label,
        value,
        desc,
      })),
    });
  };

  const handleGroupChange = (index: number, value: string) => {
    const columnConfig = columns?.find(
      (column: any) => column?.accessorKey === value,
    ) as any;
    const label = (columnConfig?.header as string) ?? '';
    const entity = columnConfig?.search_config?.entity || columnConfig.entity;
    const field = columnConfig?.search_config?.field || value;
    const groupItem = {
      field: `${entity}.${field}`,
      label,
      value,
    };
    update(index, {
      ...fields[index]!,
      ...groupItem,
    });

    handleUpdateFilter({
      groups: fields.map((item, i) =>
        i === index
          ? { ...groupItem }
          : {
              field: item.field,
              label: item.label,
              value: item.value,
              desc: item.desc,
            },
      ),
    });
  };

  const handleGroupSortChange = (index: number, value: string) => {
    update(index, {
      ...fields[index]!,
      desc: value === 'desc',
    });

    handleUpdateFilter({
      groups: fields.map((item, i) =>
        i === index
          ? { ...item, desc: value === 'desc' }
          : {
              field: item.field,
              label: item.label,
              value: item.value,
              desc: item.desc,
            },
      ),
    });
  };

  const handleGroupMove = (activeIndex: number, overIndex: number) => {
    move(activeIndex, overIndex);
    const updatedGroups = [...fields];
    const [movedItem] = updatedGroups.splice(activeIndex, 1);
    updatedGroups.splice(overIndex, 0, movedItem!);

    handleUpdateFilter({
      groups: updatedGroups.map(({ field, label, value, desc }) => ({
        field,
        label,
        value,
        desc,
      })),
    });
  };

  const handleGroupRemove = (index: number) => {
    const updatedGroups = fields.filter((_, i) => i !== index);
    remove(index);
    handleUpdateFilter({
      groups: updatedGroups.map(({ field, label, value, desc }) => ({
        field,
        label,
        value,
        desc,
      })),
    });
  };

  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="grid gap-3">
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
                  value={group.value}
                  onValueChange={(value) => {
                    handleGroupChange(index, value);
                  }}
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select a Field" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {columns?.map((column: any, index: any) => (
                      <SelectItem key={index} value={column.accessorKey}>
                        {column.header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  // if undefined it must be the placeholder
                  value={
                    group.desc === undefined ? '' : group.desc ? 'desc' : 'asc'
                  }
                  onValueChange={(value) => handleGroupSortChange(index, value)}
                >
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select a Sort Order" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleGroupRemove(index)}
                  Icon={CircleMinus}
                  iconPlacement="left"
                  iconClassName="text-red-600 h-4 w-4"
                  className="ms-2"
                  variant={'ghost'}
                />
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
