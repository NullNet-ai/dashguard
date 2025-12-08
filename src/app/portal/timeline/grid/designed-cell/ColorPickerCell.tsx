'use client';

import React from 'react';

import { type Row, type Column } from '@tanstack/react-table';
const ColorPickerCell = ({ row, column }: { row: Row<any>, column: Column<any>}) => {
  
  const accessorKey = column?.id;
  const value: any= row?.getValue(accessorKey!);

  return (
    <div className="flex items-center gap-1">
      <div
        className="size-[0.9rem] rounded-full"
        style={{
          backgroundColor: value || '',
        }}
      />
      <span className="uppercase">{value}</span>
    </div>
  );
};

export default ColorPickerCell;
