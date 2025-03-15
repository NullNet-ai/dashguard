import React, { useContext, useMemo, useRef, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardFooter, CardHeader } from '~/components/ui/card';
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area';
import { useSidebar } from '~/components/ui/sidebar';
import { Table, TableHeader } from '~/components/ui/table';
import useWindowSize from '~/hooks/use-resize';
import { cn } from '~/lib/utils';
import { remToPx } from '~/utils/fetcher';

import Pagination from '../../Pagination';
import { GridContext } from '../../Provider';
import Search from '../../Search';
import Sorting from '../../Sorting';
import MyTableBody from '../../TableBody';
import MyTableHead from '../../TableHead';
import { type IExpandedRow } from '../../types';

interface IGridDesktopProps {
  parentType: 'grid' | 'form' | 'field' | 'grid_expansion';
  hideSearch?: boolean;
  height?: string;
  showAction?: boolean;
  parentProps?: {
    width?: string;
    open?: boolean;
    summary?: boolean;
     metadata?: any
  };
  showPagination?: boolean;
  gridLevel?: number;
  isLoading?: boolean;
  parentExpanded?: IExpandedRow[];
}

function GridDesktop({
  parentType,
  hideSearch,
  height,
  showAction,
  parentProps,
  showPagination = false,
  gridLevel = 1,
  isLoading,
  parentExpanded
}: IGridDesktopProps) {
  const { state, actions } = useContext(GridContext);
  const { open: sidebarOpen } = useSidebar();
  const { width } = useWindowSize();
  const newWidth = width <= 0 ? 1920 : width;
  const _width = sidebarOpen ? newWidth - remToPx(17) : newWidth - remToPx(6);

  const [isEndReached, setIsEndReached] = useState(false);

  const { open, summary } = parentProps || {};

  const conWidth = useMemo(() => {
    if (open && summary) {
      return 'lg:w-[calc(100vw-578px)]';
    } else if (!open && summary) {
      return 'w-auto';
    } else if (open && !summary) {
      return 'w-[calc(100vw-320px)]';
    } else return '';
  }, [open, summary]);

  const isExpandedTable = parentType === 'grid_expansion';

  const expandedWidth = useMemo(() => {
    if (isExpandedTable) {
      return _width - 90 - (gridLevel === 3 ? 100 : 0);
    } else {
      return undefined;
    }
  }, [isExpandedTable, _width]);

  return (
    <>
      {/* <div>
    Accounts
    </div>
    <Separator /> */}
      {/* {hideSearch ? null : ( */}
      <div
        className={cn(
          `flex justify-between`,
          `${isExpandedTable ? 'flex-row-reverse' : 'flex-col px-4'}`,
        )}
        style={{
          width: isExpandedTable ? expandedWidth : 'calc(100vw - 37rem)',
        }}
      >
        {!hideSearch && <Search parentType={parentType} />}
        {/* <GridSearchProvider>
          <SearchDialog />
        </GridSearchProvider> */}
        {['form', 'grid_expansion'].includes(parentType) && (
          <Sorting
            className={cn(`${isExpandedTable ? 'mb-[2px] self-end' : ''}`)}
          />
        )}
      </div>

      <Card
        className={cn(
          `col-span-full border-0 shadow-none`,
          `${isExpandedTable ? 'bg-transparent' : ''}`,
        )}
      >
        {parentType !== 'field' && (
          <CardHeader
            className={cn(`${parentType === 'grid_expansion' ? 'py-0' : ''}`)}
          >
            <div className="flex flex-row space-x-2">
              {state?.config?.actionType === 'multi-select' && (
                <Button
                  type="button"
                  onClick={() => {
                    actions?.handleMultiSelect();
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
            onReachEnd={() => {
              if (!isEndReached) {
                setIsEndReached(true);
              }
            }}
            onNotReachEnd={() => {
              if (isEndReached) {
                setIsEndReached(false);
              }
            }}
            className={cn(
              `scrollarea-container m-auto overflow-auto rounded-md border bg-card text-card-foreground lg:w-auto`,
              conWidth,
              `scroll-grid-aria-${parentType}`,
              parentType === 'grid'
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
                <MyTableHead />
              </TableHeader>
              <MyTableBody
                reachEnd={isEndReached}
                showAction={showAction}
                gridLevel={gridLevel}
                isLoading={isLoading}
                showPagination={showPagination}
                parentExpanded={parentExpanded}
              />
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        {parentType === 'grid' || showPagination ? (
          <CardFooter>
            <Pagination width={expandedWidth} />
          </CardFooter>
        ) : null}
      </Card>
    </>
  );
}

export default GridDesktop;
