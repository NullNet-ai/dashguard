import { Button as Button2, Button as HeadlessBtn } from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { RowSelectionState, type ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronLeft, ChevronRight, FileIcon } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { TooltipProvider } from '~/components/ui/tooltip';
import {
  ArchiveComponent,
  DeleteComponent,
  EditComponent,
  RestoreComponent,
} from '../DefatultRow/Actions';
import type { IConfigGrid } from '../types';

export const useActionColumns = (
  config: IConfigGrid,
  rowSelection: RowSelectionState,
  showArchiveConfirmationModal: boolean,
  setShowArchiveConfirmationModal: (value: boolean) => void,
  setRowToArchive: (value: any) => void,
  handleSingleSelect: (row: any) => void,
  viewMode: 'table' | 'card',
) => {
  const selectTableRow = useRef<ColumnDef<any>>({
    id: 'select',
    size: 50,
    enableResizing: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        className="ml-1 border-foreground"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        className="ml-1 border-foreground"
        onCheckedChange={(value) => {
          row.toggleSelected(!!value);
        }}
      />
    ),
    enableSorting: false,
    enableHiding: true,
  });

  const expandTableRow = useRef<ColumnDef<any>>({
    id: 'expand',
    size: 50,
    enableResizing: false,
    header: '',
    cell: ({ row }: any) => (
      <HeadlessBtn onClick={() => row.toggleExpanded()}>
        {row.getIsExpanded() ? (
          <>
            {config?.rowExpansionOptions?.icons?.expandIcon ? (
              config?.rowExpansionOptions?.icons?.expandIcon
            ) : (
              <ChevronDown className="h-6 w-6 text-primary" />
            )}
          </>
        ) : (
          <>
            {config?.rowExpansionOptions?.icons?.collapseIcon ? (
              config?.rowExpansionOptions?.icons?.collapseIcon
            ) : config?.rowExpansionOptions?.expandPosition === 'left' ||
              !config?.rowExpansionOptions?.expandPosition ? (
              <ChevronRight className="h-6 w-6 text-default/40" />
            ) : (
              <ChevronLeft className="h-6 w-6 text-default/40" />
            )}
          </>
        )}
      </HeadlessBtn>
    ),
    enableSorting: false,
    enableHiding: true,
  });

  const actionRow = useRef<ColumnDef<any>>({
    id: 'action',
    size: 1,
    enableResizing: false,
    header: 'Actions',
    cell: ({ row }) => {
      // Check if the row has either 'draft' or desired accessor
      const showActions = [
        'draft',
        'active',
        'Draft',
        'Active',
        'Archived',
        'archived',
      ].includes(row.original?.status);

      if (!showActions) return null;

      const statusesIncluded = config?.statusesIncluded || [];
      const selectedRecords = Object.keys(rowSelection);
      const disableActions =
        selectedRecords.includes(row.original.id) ||
        !statusesIncluded?.includes(row.original?.status);

      const showCustomActionOnly =
        config?.disableDefaultAction && config?.customRowAction;

      if (config?.actionType === 'single-select') {
        return (
          <Button2
            className="mx-auto flex cursor-pointer"
            disabled={disableActions}
            type="button"
            onClick={() => handleSingleSelect(row.original)}
          >
            <PlusCircleIcon
              className={`h-5 w-5 ${disableActions ? 'text-gray-400' : 'text-primary'}`}
            />
          </Button2>
        );
      }

      if (config?.actionType === 'multi-select') {
        return (
          <Button
            className="mx-auto flex"
            disabled={disableActions}
            type="button"
            variant="ghost"
            onClick={() => handleSingleSelect(row.original)}
          >
            <FileIcon className="h-5 w-5 text-primary" />
          </Button>
        );
      }

      if (showCustomActionOnly) {
        return (
          <>
            {config?.customRowAction &&
              config?.customRowAction({
                row,
                config,
              })}
          </>
        );
      }

      return (
        <TooltipProvider>
          <EditComponent row={row} config={config!} />
          {!['Archived', 'Delete'].includes(row.original?.status) && (
            <ArchiveComponent
              config={config!}
              open={showArchiveConfirmationModal}
              record={row}
              row={row}
              setOpen={setShowArchiveConfirmationModal}
              setRecord={setRowToArchive}
            />
          )}
          {row.original?.status === 'Archived' && (
            <>
              <RestoreComponent config={config!} row={row} />
              <DeleteComponent config={config!} row={row} />
            </>
          )}
          {config?.customRowAction &&
            config?.customRowAction({
              row,
              config,
              viewMode,
            })}
        </TooltipProvider>
      );
    },
    enableSorting: false,
    enableHiding: true,
  });

  const groupByColumn = useRef<ColumnDef<any>>({
    id: 'grouping',
    header: 'Group By',
    size: 200,
    enableResizing: false,
    accessorKey: 'value',
  });

  return {
    selectTableRow,
    expandTableRow,
    actionRow,
    groupByColumn,
  };
};
