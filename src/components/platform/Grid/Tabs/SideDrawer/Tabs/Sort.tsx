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

interface SortItem {
  field: string;
  order: 'asc' | 'desc';
}

export default function SortContent() {
  const [sorts, setSorts] = useState<SortItem[]>([
    { field: '', order: 'asc' },
  ]);

  const handleAddSort = () => {
    setSorts([...sorts, { field: '', order: 'asc' }]);
  };

  const handleSortChange = (index: number, field: keyof SortItem, value: string) => {
    const newSorts = sorts.map((sort, i) => {
      if (i === index) {
        return { ...sort, [field]: value };
      }
      return sort;
    });
    setSorts(newSorts);
  };

  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">


      {sorts.map((sort, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select
            value={sort.field}
            onValueChange={(value) => handleSortChange(index, 'field', value)}
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
            onValueChange={(value) => handleSortChange(index, 'order', value as 'asc' | 'desc')}
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
      ))}
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
