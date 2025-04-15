'use client';
import { flexRender } from '@tanstack/react-table';
import React, { useContext, useMemo } from 'react';

import useScreenType from '~/hooks/use-screen-type';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { GridContext } from '../../../Provider';
import ArchiveConfirmationModal from '../../../views/ArchiveConfirmationModal';

import GridMobileRowContent from './GridMobileRowContent';

export default function GridMobileRow({
  parent = 'grid',
  gridLevel,
}: {
  parent?: string
  gridLevel?: number
}) {
  const { state, actions } = useContext(GridContext);
  
  const { config, showArchiveConfirmationModal } = state ?? {};
  const { setRowToArchive, setShowArchiveConfirmationModal } = actions ?? {};
  const size = useScreenType();
  const { defaultShownColumns, statusColumn, defaultValues  } = state?.config ?? {}

  const level = state?.gridLevel

  const getCols = useMemo(() => {

    if(state?.viewMode === 'card') {
      return 'grid-cols-1'
    }

    switch (size) {
      case 'sm':
        return 'grid-cols-1';
      case 'md':
        return 'grid-cols-1';
      case 'lg':
        return 'grid-cols-2';
      case 'xl':
      case '2xl':
        return 'grid-cols-3';
      default:
        return 'grid-cols-1';
    }
  }, [size]);

  return (
    <div
      className={cn('grid lg:gap-4 lg:gap-y-4 gap-y-2 overflow-y-auto', getCols)}
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-crd-container`,
      )}
    >
      {state?.table.getRowModel().rows?.length
        ? (
            state?.table.getRowModel().rows.map((row, rowIndex) => {
              // Get visible cells excluding action column
              const visibleCells = row
                .getVisibleCells()
                .filter(cell => cell.column.id !== 'action')

                const getCell = (name: string) => {
                  return row
                  .getVisibleCells()
                  .find(cell => cell.column.id === name)
                }

                const statColumn = statusColumn ? row.getVisibleCells().find(
                  (cell) => cell.column.id === statusColumn,
                ) : null;

                const selectedDefaultCells = row.getVisibleCells().filter((cell) =>
                  defaultShownColumns?.includes(cell.column.id),
                );
      

              return (
                <GridMobileRowContent
                  row={row}
                  key={row.id}
                  rowIndex={rowIndex}
                  state={state}
                  statusCell={getCell('status')}
                  codecell={getCell( defaultValues?.id || 'code')}
                  categoryCell={getCell('categories')}
                  flexRender={flexRender}
                    selectedDefaultCells={selectedDefaultCells}
                  parent={parent}
                  config={config}
                  showArchiveConfirmationModal={showArchiveConfirmationModal}
                  setShowArchiveConfirmationModal={setShowArchiveConfirmationModal}
                  setRowToArchive={setRowToArchive}
                  visibleCells={visibleCells}
                  gridLevel={level}
                  statColumn={statColumn}
                />
              )
            })
          )
        : (
            <div className="p-4 lg:p-0 ">
              <div className={cn(`text-center text-foreground text-sm `, `${gridLevel === 1 ? 'lg:h-24 lg:text-base' : 'text-sm'} `)}>No results.</div>
            </div>
          )}
      {state?.showArchiveConfirmationModal && (
        <ArchiveConfirmationModal
          config={state?.config}
          open={state?.showArchiveConfirmationModal}
          record={state?.rowToArchive}
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          setOpen={actions?.setShowArchiveConfirmationModal!}
        />
      )}
    </div>
  );
}
