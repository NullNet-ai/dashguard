'use client';

import { type Column, type Row } from '@tanstack/react-table';
import React from 'react';
import { Progress } from '~/components/ui/progress';

export function ProgressBar({ row, column }: { row: Row<any>; column?: Column<any> } ) {
  const accessorKey = column?.id;
  const value: any= row?.getValue(accessorKey!);
  const parseValue = (val: any, defaultVal = 0) => {
    if (!val) return defaultVal;
    if (typeof val === 'number') return val;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  };

  const showPercentage = true;
  const colorThresholds = [
    { color: '#66ab2a', percentage: 85 },
    { color: '#fdba8c', percentage: 60 },
    { color: '#d97070', percentage: 0 },
  ]

  return (
    <div className={`w-32 p-1 text-sm `}>
      <Progress
        value={parseValue(value, 0)}
        labelColor="black"
        labelPosition={showPercentage ? 'end-outside' : 'follow'}
        colorThresholds={colorThresholds}
        size={'sm'}
        className="block h-2"
      />
    </div>
  );
}
