'use client';

import React from 'react';

import { type Row, type Column } from '@tanstack/react-table';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Label } from '~/components/ui/label';
const RadioCell = ({ row, column }: { row: Row<any>, column: Column<any>}) => {
  
  const accessorKey = column?.id;
  const value: any= row?.getValue(accessorKey!);

  return (
    <RadioGroup>
    <div className="flex items-center gap-1 gap-x-2">
      <RadioGroupItem value="radio" id="radio" checked={!!value} />
      <Label htmlFor="radio">Radio Label</Label>
    </div>
  </RadioGroup>
  );
};

export default RadioCell;
