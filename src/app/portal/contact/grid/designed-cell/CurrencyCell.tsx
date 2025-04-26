import React from 'react';
import { type Row, type Column } from '@tanstack/react-table';

export const CurrencyCell = ({
  row,
  column,
}: {
  row: Row<any>;
  column: Column<any>;
}) => {
  const accessorKey = column?.id;
  const value: any = row?.getValue(accessorKey!);

  // Helper function to safely parse values
  const parseValue = (val: any, defaultVal = 0) => {
    if (!val) return defaultVal;
    if (typeof val === 'number') return val;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  };

  const newValue = parseValue(value);
  const formattedValue = Number(newValue).toFixed(2);

  return (
    <div className={`flex items-center`}>
      <span className="mr-1">$</span>
      <span>{formattedValue}</span>
    </div>
  );
};
