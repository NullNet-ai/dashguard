'use client';

import React from 'react';
import { type Row, type Column } from '@tanstack/react-table';
import PillCell from './PillCell';
const MultiPillCell = ({
  row,
  column,
  metadata,
}: {
  row: Row<any>;
  column?: Column<any>;
  metadata?: any;
}) => {
  const accessorKey = column?.id;
  const value: any = row?.getValue(accessorKey!);

  //check if value is array format
  const parseValues = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;

    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse values:', error);
      return [];
    }
  };

  const values = parseValues(value);

  // Find the matching attribute for each value
  const getStylesForValue = (val: string) => {
    const matchingAttribute = metadata?.colors?.[0]?.attributes?.find(
      (attr: any) => attr.name === val,
    );
    return {
      color: matchingAttribute?.color || 'bg-gray-400/10',
      textColor: matchingAttribute?.textColor || 'text-gray-400',
    };
  };

  return (
    <div className="group/inner relative flex">
      {metadata?.renderAction && values?.length ? (
        <div className="absolute flex h-full w-full flex-1 items-center justify-center gap-x-1 bg-gray-500/25 opacity-0 group-hover/inner:opacity-100">
          <div className="absolute h-full w-full bg-gray-500 opacity-35" />
          <div className="relative z-10 flex gap-x-2">
            {metadata?.renderAction ? metadata?.renderAction : null}
          </div>
        </div>
      ) : null}
      {values?.map((value: string, index: number) => {
        return (
          <PillCell
            bgColor={getStylesForValue(value).color}
            textColor={getStylesForValue(value).textColor}
            key={index}
            value={value}
          />
        );
      })}
    </div>
  );
};

export default MultiPillCell;
