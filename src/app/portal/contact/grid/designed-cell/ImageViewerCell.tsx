'use client';

import React from 'react';

import { type Column, type Row } from '@tanstack/react-table';
import ImageViewer from '~/components/ui/image-viewer';
import { Eye, Pencil } from 'lucide-react';
const ImageViewerCell = ({ row, column, metadata }: { row: Row<any>; column?: Column<any>, metadata?: any })=> {
  const accessorKey = column?.id;
  const value: any= row?.getValue(accessorKey!);

  return (
    <div className="flex items-center gap-1">
      <ImageViewer
        className="aspect-video !w-[50px] object-cover"
        src={value}
        // for grid designing only, remove this when you use it in your project
        overlayContent={
          <div className="flex items-center gap-1">
            <div className="flex size-5 cursor-pointer items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white">
              {metadata?.renderAction ? metadata?.renderAction : null}
            </div>
            <div className="flex size-5 cursor-pointer items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white">
              <Eye className="size-3 text-emerald-600" />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default ImageViewerCell;
