'use client';
import { flexRender } from '@tanstack/react-table';
import React, { useContext, useMemo } from 'react';


import useScreenType from '~/hooks/use-screen-type';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';


import { GridContext } from '../Provider';
import ArchiveConfirmationModal from '../views/ArchiveConfirmationModal';
import GridCardViewContent from './GridCardViewContent';

export default function GridCardView({parentType} : any) {
  const { state, actions } = useContext(GridContext);
  const { config, showActionConfirmationModal } = state ?? {};
  const { setRowToArchive, setShowActionConfirmationModal } = actions ?? {};
  const size = useScreenType();
  const { defaultShownColumns, statusColumn, CustomRenderCardView  } = state?.config ?? {}

  const getCols = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'grid-cols-1';
      case 'md':
        return 'grid-cols-2';
      case 'lg':
        return 'grid-cols-2';
      case 'xl':
        return 'grid-cols-3';
      case '2xl':
        return 'grid-cols-4';
      default:
        return 'grid-cols-1';
    }
  }, [size]);

  return (
    <div
      className={cn('grid gap-4', getCols)}
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-crd-container`,
      )}
      style={{ gridAutoFlow: 'row', gridAutoRows: 'auto' }}
    >
      {state?.table.getRowModel().rows?.length ? (
        state?.table.getRowModel().rows.map((row, rowIndex) => {
          // Get visible cells excluding action column
          const visibleCells = row
            .getVisibleCells()
            .filter((cell) => cell.column.id !== 'action');
          const statusCell = row
            .getVisibleCells()
            .find((cell) => cell.column.id === 'status');
            const codecell = row
            .getVisibleCells()
            .find((cell) => cell.column.id === 'code');

            const categoryCell = row
            .getVisibleCells()
            .find((cell) => cell.column.id === 'categories');

            const statColumn = statusColumn ? row.getVisibleCells().find(
              (cell) => cell.column.id === statusColumn,
            ) : null;

            const selectedDefaultCells = row.getVisibleCells().filter((cell) =>
              defaultShownColumns?.includes(cell.column.id),
            );

            if (CustomRenderCardView) {
              return <CustomRenderCardView key={rowIndex} row={row}/>
            }

            return <GridCardViewContent
                row={row}
                key={row.id}
                rowIndex={rowIndex}
                state={state}
                statusCell={statusCell}
                codecell={codecell}
                categoryCell={categoryCell}
                flexRender={flexRender}
                parent={parentType}
                config={config}
                showActionConfirmationModal={showActionConfirmationModal}
                setShowActionConfirmationModal={setShowActionConfirmationModal}
                setRowToArchive={setRowToArchive}
                visibleCells={visibleCells}
                selectedDefaultCells={selectedDefaultCells}
                statColumn={statColumn}
              />
        })
      ) : (
        <div>
          <div className="h-24 text-center text-foreground">No results.</div>
        </div>
      )}
      {state?.showActionConfirmationModal && (
        <ArchiveConfirmationModal
          config={state?.config}
          open={state?.showActionConfirmationModal}
          record={state?.rowToArchive}
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          setOpen={actions?.setShowActionConfirmationModal!}
        />
      )}
    </div>
  );
}
