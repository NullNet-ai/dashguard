'use client';

import { CircleMinus, Plus, Trash2 } from 'lucide-react';
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
import { useManageFilter } from '../Provider';

interface FilterItem {
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

export default function FilterContent() {
  const { actions } = useManageFilter()
  const { handleUpdateFilter } = actions;
  
  const [filters, setFilters] = useState<FilterItem[]>([
    { field: '', operator: '', value: '' },
  ]);

  const handleAddFilter = () => {
    const newFilters = [...filters, { field: '', operator: '', value: '' }];
    setFilters(newFilters);
    updateProviderFilters(newFilters);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
    updateProviderFilters(newFilters);
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
    updateProviderFilters(newFilters);
  };

  const updateProviderFilters = (filters: FilterItem[]) => {
    const formattedFilters = filters.map((filter) => ({
      operator: filter.operator.toLowerCase(),
      type: 'criteria',
      field: filter.field.toLowerCase(),
      label: filter.field,
      values: [filter.value],
      default: true
    }));

    handleUpdateFilter({ default_filter: formattedFilters });
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
          {index > 0 && (
            <Select defaultValue="AND">
              <SelectTrigger className="w-[100px] border-gray-200 bg-white">
                <SelectValue placeholder="AND" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select
            value={filter.field}
            onValueChange={(value) => handleFilterChange(index, 'field', value)}
          >
            <SelectTrigger className="w-[200px] border-gray-200 bg-white">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.operator}
            onValueChange={(value) =>
              handleFilterChange(index, 'operator', value)
            }
          >
            <SelectTrigger className="w-[200px] border-gray-200 bg-white">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="equal">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="startsWith">Starts with</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Input
              value={filter.value}
              onChange={(e) =>
                handleFilterChange(index, 'value', e.target.value)
              }
              className="border-gray-200 bg-white"
              placeholder="Enter the value"
            />
            {filter.value && (
              <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center">
                <span className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-sm text-blue-700">
                  {filter.value}
                </span>
              </div>
            )}
          </div>

          {filters.length > 1 && 
          <Button
            onClick={() => handleRemoveFilter(index)}
            Icon={CircleMinus}
            iconPlacement="left"
            iconClassName="text-red-600 h-4 w-4"
            className="ms-2"
            variant={'ghost'}
          />
          }
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
