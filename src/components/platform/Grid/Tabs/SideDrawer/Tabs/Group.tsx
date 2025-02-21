'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface GroupItem {
  field: string;
  order: 'asc' | 'desc';
}

const FIELDS = [
  'category',
  'status',
  'priority',
  'assignee',
] as const;

const ORDERS = ['asc', 'desc'] as const;

export default function GroupContent() {
  const [groups, setGroups] = useState<GroupItem[]>([
    { field: '', order: 'asc' },
  ]);

  const handleAddGroup = () => {
    setGroups([...groups, { field: '', order: 'asc' }]);
  };

  const handleGroupChange = (
    index: number,
    field: keyof GroupItem,
    value: string,
  ) => {
    const newGroups = groups.map((group, i) => {
      if (i === index) {
        return { ...group, [field]: value };
      }
      return group;
    });
    setGroups(newGroups);
  };

  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      {groups.map((group, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select
            value={group.field}
            onValueChange={(value) => handleGroupChange(index, 'field', value)}
          >
            <SelectTrigger className="w-[200px] border-gray-200 bg-white">
              <SelectValue placeholder="Select a Field" />
            </SelectTrigger>
            <SelectContent>
              {FIELDS.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={group.order}
            onValueChange={(value) =>
              handleGroupChange(index, 'order', value as 'asc' | 'desc')
            }
          >
            <SelectTrigger className="w-[200px] border-gray-200 bg-white">
              <SelectValue placeholder="Select a Sort Order" />
            </SelectTrigger>
            <SelectContent>
              {ORDERS.map((order) => (
                <SelectItem key={order} value={order}>
                  {order}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      <div className="flex justify-start">
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
    </div>
  );
}
