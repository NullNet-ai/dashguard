'use client';

import { CircleMinus, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useManageFilter } from '../Provider';
import MultipleSelector from '~/components/ui/multi-select';

interface FilterItem {
  operator: string;
  type: 'criteria' | 'operator';
  field?: string;
  label?: string;
  values?: string[];
  default: boolean;
}

interface MultiSelectOption {
  label: string;
  value: string;
}

const OPERATORS = [
  { value: 'equal', label: 'Equals' },
  { value: 'not_equal', label: 'Not Equal' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'greater_than_or_equal', label: 'Greater Than Or Equal' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'less_than_or_equal', label: 'Less Than Or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'is_null', label: 'Is Null' },
  { value: 'is_not_null', label: 'Is Not Null' },
  { value: 'is_between', label: 'Is Between' },
  { value: 'is_not_between', label: 'Is Not Between' },
  { value: 'like', label: 'Like' },
] as const;

export default function FilterContent() {
  const { actions, state } = useManageFilter();
  const { handleUpdateFilter } = actions;
  const { filterDetails, columns } = state ?? {};
  const filters: FilterItem[] = filterDetails?.default_filter ?? [
    {
      operator: '',
      type: 'criteria',
      field: '',
      label: '',
      values: [],
    }
  ]

  const handleAddFilter = () => {
    if (filters?.length > 0) {
      const newFilters: FilterItem[] = [
        ...filters,
        {
          operator: 'and',
          type: 'operator',
          default: true,
        },
        {
          operator: '',
          type: 'criteria',
          field: '',
          label: '',
          values: [],
          default: true,
        },
      ];
      handleUpdateFilter({ default_filter: newFilters });
    }
  };

  const handleRemoveFilter = (criteriaIndex: number) => {
    const actualIndex = criteriaIndex * 2;
    const newFilters = filters.filter((_, index) => 
      index !== actualIndex && index !== actualIndex - 1
    );
    handleUpdateFilter({ default_filter: newFilters });
  };

  const handleFilterChange = (
    criteriaIndex: number,
    field: 'field' | 'operator',
    value: string,
  ) => {
    const actualIndex = criteriaIndex * 2;
    const newFilters = filters.map((filter, index) => {
      if (index === actualIndex) {
        return {
          ...filter,
          ...(field === 'field' ? { field: value, label: value } : { operator: value }),
        };
      }
      return filter;
    });
    handleUpdateFilter({ default_filter: newFilters });
  };

  const handleValueChange = (criteriaIndex: number, values: string[]) => {
    const actualIndex = criteriaIndex * 2;
    const newFilters = filters.map((filter, index) => 
      index === actualIndex ? { ...filter, values } : filter
    );
    handleUpdateFilter({ default_filter: newFilters });
  };

  const handleLogicalOperatorChange = (criteriaIndex: number, value: string) => {
    const operatorIndex = (criteriaIndex * 2) - 1;
    const newFilters = filters.map((filter, index) => 
      index === operatorIndex && filter.type === 'operator'
        ? { ...filter, operator: value.toLowerCase() }
        : filter
    );
    handleUpdateFilter({ default_filter: newFilters });
  };

  const criteriaFilters = filters.filter((filter): filter is FilterItem => 
    filter.type === 'criteria'
  );

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

      <div className="space-y-3">
        {criteriaFilters.map((filter, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <Select
                defaultValue="and"
                onValueChange={(value) => handleLogicalOperatorChange(index, value)}
              >
                <SelectTrigger className="w-[100px] border-gray-200 bg-white">
                  <SelectValue placeholder="AND" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="and">AND</SelectItem>
                  <SelectItem value="or">OR</SelectItem>
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
                {columns?.map((column: any, idx: number) => (
                  <SelectItem key={idx} value={column.accessorKey}>
                    {column.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.operator}
              onValueChange={(value) => handleFilterChange(index, 'operator', value)}
            >
              <SelectTrigger className="w-[200px] border-gray-200 bg-white">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {OPERATORS.map((operator) => (
                  <SelectItem key={operator.value} value={operator.value}>
                    {operator.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <MultipleSelector 
                onChange={(e: MultiSelectOption[]) => {
                  const values = e.map((item) => item.value);
                  handleValueChange(index, values);
                }}
                value={filter.values?.map((value) => ({ label: value, value }))}
                placeholder="Enter value"
                creatable={true}
                emptyIndicator=""
              />
            </div>

            {filters.length > 1 && (
              <Button
                onClick={() => handleRemoveFilter(index)}
                Icon={CircleMinus}
                iconPlacement="left"
                iconClassName="text-red-600 h-4 w-4"
                className="ms-2"
                variant="ghost"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
