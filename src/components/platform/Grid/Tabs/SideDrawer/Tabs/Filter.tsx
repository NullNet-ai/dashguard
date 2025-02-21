'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface FilterItem {
  field: string;
  operator: string;
  value: string;
}

export default function FilterContent() {
  const [filters, setFilters] = useState<FilterItem[]>([
    { field: 'State', operator: 'Equals', value: 'Draft' },
  ]);

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: '', value: '' }]);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
  };

  const handleFilterChange = (
    index: number,
    field: keyof FilterItem,
    value: string,
  ) => {
    const newFilters = filters.map((filter, i) => {
      if (i === index) {
        return { ...filter, [field]: value };
      }
      return filter;
    });
    setFilters(newFilters);
  };

  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFilter}
          className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Filter
        </Button>
      </div>

      {filters.map((filter, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select defaultValue={filter.field}>
            <SelectTrigger className="w-[200px] border-gray-200 bg-white">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="State">State</SelectItem>
              <SelectItem value="Category">Category</SelectItem>
              <SelectItem value="Status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue={filter.operator}>
            <SelectTrigger className="w-[200px] border-gray-200 bg-white">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Equals">Equals</SelectItem>
              <SelectItem value="Contains">Contains</SelectItem>
              <SelectItem value="StartsWith">Starts with</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Input
              value={filter.value}
              onChange={(e) =>
                handleFilterChange(index, 'value', e.target.value)
              }
              className="border-gray-200 bg-white pr-20"
            />
            {filter.value && (
              <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center">
                <span className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-sm text-blue-700">
                  {filter.value}
                  <button
                    onClick={() => handleRemoveFilter(index)}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFilter}
          className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Group Filter
        </Button>
      </div>
    </div>
  );
}
