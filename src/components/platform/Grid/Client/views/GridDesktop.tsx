import React, { useContext, useMemo } from 'react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardFooter, CardHeader } from '~/components/ui/card'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Table, TableHeader } from '~/components/ui/table'
import { cn } from '~/lib/utils'

import Pagination from '../../Pagination'
import { GridContext } from '../../Provider'
import Search from '../../Search'
import Sorting from '../../Sorting'
import MyTableBody from '../../TableBody'
import MyTableHead from '../../TableHead'

interface IGridDesktopProps {
  parentType: 'grid' | 'form' | 'field' | 'grid_expansion'
  hideSearch?: boolean
  height?: string
  showAction?: boolean
  parentProps?: {
    width?: string
    open?: boolean
    summary?: boolean
  }
  showPagination?: boolean
}

function GridDesktop({
  parentType,
  hideSearch,
  height,
  showAction,
  parentProps,
  showPagination = false,
}: IGridDesktopProps) {
  const { state, actions } = useContext(GridContext)

  const rowsLen = state?.table?.getVisibleFlatColumns()?.length || 0

  const { open, summary } = parentProps || {}

  const conWidth = useMemo(() => {
    if (open && summary) {
      return 'lg:w-[calc(100vw-578px)]'
    }
    else if (!open && summary) {
      return 'w-auto'
    }
    else if (open && !summary) {
      return 'w-[calc(100vw-320px)]'
    }
    else return ''
  }, [open, summary])

  const isExpandedTable = parentType === 'grid_expansion'

  const expandedWidth = useMemo(() => {
    if (isExpandedTable) {
      return rowsLen > 4 ? 250 * rowsLen : 250 * 5
    }
    else {
      return undefined
    }
  }, [isExpandedTable])

  return (
    <>
      {/* <div>
    Accounts
    </div>
    <Separator /> */}
      {/* {hideSearch ? null : ( */}
      <div
        className="flex flex-col justify-between px-4"
        style={{ width: 'calc(100vw - 37rem)' }}
      >
        {!hideSearch && <Search parentType='form' />}
        {['form', 'grid_expansion'].includes(parentType) && <Sorting />}
      </div>

      <Card
        className={cn(
          `col-span-full border-0 shadow-none`, `${isExpandedTable ? 'bg-transparent' : ''}`,
        )}
      >
        {parentType !== 'field' && (
          <CardHeader
            className={cn(`${parentType === 'grid_expansion' ? 'py-0' : ''}`)}
          >
            <div className='flex flex-row space-x-2'>
              {state?.config?.actionType === 'multi-select' && (
                <Button
                  type="button"
                  onClick={() => {
                    actions?.handleMultiSelect()
                  }}
                >
                  <Badge className="mx-2 text-white" color="green">
                    {state?.totalCountSelected || 0}
                  </Badge>
                  Submit
                </Button>
              )}
            </div>
          </CardHeader>
        )}
        <div
          className={cn(`${parentType === 'form' ? 'px-4' : ''}`)}
          style={{ width: expandedWidth }}
        >
          <ScrollArea
            className={cn(
              `scrollarea-container m-auto overflow-auto rounded-md border bg-card text-card-foreground lg:w-auto`, conWidth, parentType === 'grid'
                ? 'w-[350px] md:w-[460px]'
                : 'w-[350px] md:w-[100%]',
            )}
            style={
              parentType === 'grid'
                ? { height: 'calc(100vh - 16rem)' }
                : {
                    // width: "calc(100vw - 40rem)",
                    height: height || 'auto',
                  }
            }
          >
            <Table>
              <TableHeader parentType={parentType}>
                <MyTableHead parentType={parentType} />
              </TableHeader>
              <MyTableBody showAction={showAction} />
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
        {parentType === 'grid' || showPagination
          ? (
              <CardFooter>
                <Pagination />
              </CardFooter>
            )
          : null}
      </Card>
    </>
  )
}

export default GridDesktop
