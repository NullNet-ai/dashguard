import {type  Column, type Row } from '@tanstack/react-table';
import React from 'react';

export const DateFormatCell = ({ row, column }: { row: Row<any>, column: Column<any>})  => {
  
  const accessorKey = column?.id;
  const value: any= row?.getValue(accessorKey!);

  let dateValue: string;
  let timeValue: string | undefined;


  if (typeof value === 'object' && !(value instanceof Date)) {
    if ('date' in value) {
      dateValue = String(value.date);
      timeValue = value.time;
    } else {
      dateValue = String(value);
    }
  } else {
    dateValue = String(value);
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  if (timeValue) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  const formattedDate = dateValue;
  const formattedTime = timeValue || '';

  return (
    <div className={`text-sm`}>
      {timeValue ? (
        <div className="flex items-center gap-x-2">
          <span>{formattedDate}</span>
          <span>{formattedTime}</span>
        </div>
      ) : (
        <span>{formattedDate}</span>
      )}
    </div>
  );
};

export default DateFormatCell;
