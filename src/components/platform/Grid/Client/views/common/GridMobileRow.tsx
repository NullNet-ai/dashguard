'use client';
import { flexRender } from '@tanstack/react-table';
import React, { useContext, useMemo } from 'react';

import useScreenType from '~/hooks/use-screen-type';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { GridContext } from '../../../Provider';
import ArchiveConfirmationModal from '../../../views/ArchiveConfirmationModal';
import GridMobileRowContent from '../../../Server/views/common/GridMobileRowContent';

export default function GridMobileRow({
  parent = 'grid',
  gridLevel= 1,
}: {
  parent?: string
  gridLevel?: number
}) {
  const { state, actions } = useContext(GridContext);
  const { config, showArchiveConfirmationModal } = state ?? {};
  const { setRowToArchive, setShowArchiveConfirmationModal } = actions ?? {};
  const size = useScreenType();

  const level = state?.gridLevel || 1;

  const getCols = useMemo(() => {
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
      className={cn('grid gap-4 overflow-y-auto', getCols)}
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
    
              return (
                <GridMobileRowContent
                  row={row}
                  key={row.id}
                  rowIndex={rowIndex}
                  state={state}
                  statusCell={getCell('status')}
                  codecell={getCell('code')}
                  categoryCell={getCell('categories')}
                  flexRender={flexRender}
                  parent={parent}
                  config={config}
                  showArchiveConfirmationModal={showArchiveConfirmationModal}
                  setShowArchiveConfirmationModal={setShowArchiveConfirmationModal}
                  setRowToArchive={setRowToArchive}
                  visibleCells={visibleCells}
                  gridLevel={level}
                />
              )
            })
          )
        : (
            <div className="p-4 lg:p-0">
              <div className="lg:h-24 text-sm lg:text-base  text-center text-foreground">No results.</div>
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
