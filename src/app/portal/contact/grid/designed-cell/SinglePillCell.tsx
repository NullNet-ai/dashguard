'use client';

import React from 'react';
import { type Row, type Column } from '@tanstack/react-table';
import SinglePill from './SinglePill';
const SinglePillCell = ({ row, column }: { row: Row<any>; column?: Column<any> })=> {
  const accessorKey = column?.id;
  const value: any= row?.getValue(accessorKey!);

  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  return (
    <SinglePill value={stringValue} />
  );
};

export default SinglePillCell;
