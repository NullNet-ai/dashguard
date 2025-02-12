'use client'
import { flexRender } from '@tanstack/react-table'
import { EllipsisVertical } from 'lucide-react'
import React, { useContext, useMemo } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import useScreenType from '~/hooks/use-screen-type'
import { cn } from '~/lib/utils'
import { testIDFormatter } from '~/utils/formatter'

import {
  ArchiveComponent,
  DeleteComponent,
  EditComponent,
  RestoreComponent,
} from '../../../DefatultRow/Actions'
import { GridContext } from '../../../Provider'
import ArchiveConfirmationModal from '../../../views/ArchiveConfirmationModal'

export default function GridMobileRow({ parent = 'grid' }: { parent?: string }) {
  const { state, actions } = useContext(GridContext)
  const { config, showArchiveConfirmationModal } = state ?? {}
  const { setRowToArchive, setShowArchiveConfirmationModal } = actions ?? {}
  const size = useScreenType()

  const getCols = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'grid-cols-1'
      case 'md':
        return 'grid-cols-1'
      case 'lg':
        return 'grid-cols-2'
      case 'xl':
      case '2xl':
        return 'grid-cols-3'
      default:
        return 'grid-cols-1'
    }
  }, [size])

  return (
    <div
      className={cn('grid gap-4 overflow-y-auto', getCols)}
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-crd-container`,
      )}
    >
      {state?.table.getRowModel().rows?.length
        ? state?.table.getRowModel().rows.map((row, rowIndex) => {
          // Get visible cells excluding action column
          const visibleCells = row
            .getVisibleCells()
            .filter(cell => cell.column.id !== 'action')

          const statusCell = row
            .getVisibleCells()
            .find(cell => cell.column.id === 'status')

          return (
            <div
              className="flex flex-col justify-start rounded-md border border-b border-l-2 border-l-primary p-4 hover:bg-border/50"
              data-state={row.getIsSelected() && 'selected'}
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-crd-item-${rowIndex + 1}`,
              )}
              key={row.id}
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                {statusCell
                && flexRender(statusCell.column.columnDef.cell, {
                  ...statusCell.getContext(),
                  view_mode: 'card',
                })}
                {(parent === 'grid' || parent === 'form')
                  ? (
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild={true}>
                            <div className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-left text-sm">
                              <EllipsisVertical
                                aria-hidden="true"
                                className="h-4 w-4 font-semibold text-foreground"
                              />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="z-[100]" side="right">
                            <EditComponent
                              config={config!}
                              row={row}
                              viewMode="card"
                            />
                            {!['Archived', 'Delete'].includes(
                              row.original?.status,
                            ) && (
                              <ArchiveComponent
                                config={config!}
                                open={showArchiveConfirmationModal}
                                record={row}
                                row={row}
                                setOpen={setShowArchiveConfirmationModal}
                                setRecord={setRowToArchive}
                                viewMode="card"
                              />
                            )}
                            {row.original?.status === 'Archived' && (
                              <>
                                <RestoreComponent
                                  config={config!}
                                  row={row}
                                  viewMode="card"
                                />
                                <DeleteComponent
                                  config={config!}
                                  row={row}
                                  viewMode="card"
                                />
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  : null}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {visibleCells.map((cell, cellIndex) => {
                  // Skip id and status as they're already shown above
                  if (cell.column.id === 'id' || cell.column.id === 'status' || cell.column.id === 'select') return null

                  return (
                    <div
                      className="flex flex-row text-xs text-foreground"
                      data-test-id={testIDFormatter(
                        `${state?.config.entity}-grd-crd-item-cell-${cell.column.id}-${cellIndex + 1}`,
                      )}
                      key={cell.id}
                    >
                      <div className="mr-2 text-slate-500">
                        {flexRender(
                          // @ts-expect-error temp fix
                          cell.column.columnDef.header, cell.getContext(),
                        )}
                      </div>
                      <div className={cn(
                        ['email', 'phone'].includes(cell.column.id)
                          ? 'break-all'
                          : 'break-normal'
                      )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell, cell.getContext(),
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })

        : (
            <div className="p-4 lg:p-0">
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
