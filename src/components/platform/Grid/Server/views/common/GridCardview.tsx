'use client'
import { flexRender } from '@tanstack/react-table'
import React, { useContext, useMemo } from 'react'

import useScreenType from '~/hooks/use-screen-type'
import { cn } from '~/lib/utils'
import { testIDFormatter } from '~/utils/formatter'

import { GridContext } from '../../../Provider'
import ArchiveConfirmationModal from '../../../views/ArchiveConfirmationModal'

import GridCardViewContent from './GridCardViewContent'

export default function GridCardView({ parentType }: any) {
  const { state, actions } = useContext(GridContext)
  const { config, showArchiveConfirmationModal } = state ?? {}
  const { setRowToArchive, setShowArchiveConfirmationModal } = actions ?? {}
  const size = useScreenType()

  const getCols = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'grid-cols-1'
      case 'md':
        return 'grid-cols-2'
      case 'lg':
        return 'grid-cols-2'
      case 'xl':
      case '2xl':
        return 'grid-cols-2'
      default:
        return 'grid-cols-1'
    }
  }, [size])

  return (
    <div
      className={cn('grid gap-4', getCols)}
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-crd-container`,
      )}
      style={{ gridAutoFlow: 'row', gridAutoRows: 'auto' }}
    >
      {state?.table.getRowModel().rows?.length
        ? (
            state?.table.getRowModel().rows.map((row, rowIndex) => {
            // Get visible cells excluding action column
              const visibleCells = row
                .getVisibleCells()
                .filter(cell => cell.column.id !== 'action')
              const statusCell = row
                .getVisibleCells()
                .find(cell => cell.column.id === 'status')

              return (
                <GridCardViewContent
                  row={row}
                  key={row.id}
                  rowIndex={rowIndex}
                  state={state}
                  statusCell={statusCell}
                  flexRender={flexRender}
                  parent={parentType}
                  config={config}
                  showArchiveConfirmationModal={showArchiveConfirmationModal}
                  setShowArchiveConfirmationModal={setShowArchiveConfirmationModal}
                  setRowToArchive={setRowToArchive}
                  visibleCells={visibleCells}
                />
              )
            })
          )
        : (
            <div>
              <div className="h-24 text-center text-foreground">No results.</div>
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
  )
}
