'use client';

import React from 'react';

import { type Row, type Column } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
const AvatarCell = ({ row, column }: { row: Row<any>; column?: Column<any> }) => {
  const accessorKey = column?.id;
  const value: any= row?.getValue(accessorKey!);

  return value ? (
    <Avatar
      size={'xs'}
      statusProps={{ status: 'online', position: 'top-right' }}
    >
      <AvatarImage src={value} alt="@shadcn" />
      <AvatarFallback>{value?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
    </Avatar>
  ) : null;
};

export default AvatarCell;
