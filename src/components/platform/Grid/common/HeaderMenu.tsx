'use client';
import { Button } from '@headlessui/react';
import { type Header } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ListFilter,
} from 'lucide-react';
import { useContext, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/lib/utils';
import { GridContext } from '../Provider';
import { ISearchItem } from '../Search/types';

interface HeaderMenuProps {
  header: Header<any, unknown>;
  defaultFilter?: ISearchItem[];
}

const HeaderMenu = ({ header, defaultFilter }: HeaderMenuProps) => {
  const { state } = useContext(GridContext);
  const columnSortKey = (header?.column?.columnDef as any)?.sortKey;
  const sortingKey = Array.isArray(columnSortKey)
    ? columnSortKey[0]
    : columnSortKey;
  const sortingState = state?.sorting?.find(
    (item) => item.id === header?.id || item.id === sortingKey,
  );
  const enableSorting = header.column.getCanSort();
  const enableGrouping =
    state?.config?.enableGridGrouping && header.column.getCanGroup();
  const [open, setOpen] = useState(false);

  const formattedFilter = defaultFilter?.reduce((acc, filter, index) => {
    return `${acc} "${filter?.display_value || filter?.values?.[0]}" ${index < defaultFilter.length - 1 ? 'or' : ''}`;
  }, `${header?.column?.columnDef.header} is`);

  if (['grouping', 'action', 'select', 'expand'].includes(header.id))
    return null;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DropdownMenuTrigger
        asChild
        onClick={() => {
          setOpen(!open);
        }}
      >
        <Button
          className={cn(
            `group-hover:block group-hover:opacity-100`,
            `${open ? 'opacity-100' : 'opacity-0'}`,
          )}
        >
          {!open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="bottom">
        {!!defaultFilter?.length && (
          <>
            <DropdownMenuItem className="flex gap-2">
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-semibold">Filter</span>
                <Badge variant="primary" className="mx-1">
                  {formattedFilter}
                </Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {enableSorting && (
          <>
            {(!sortingState || sortingState.desc) && (
              <DropdownMenuItem
                className="flex gap-2"
                onClick={() => header.column.toggleSorting(false, true)}
              >
                <ArrowUp className="h-4 w-4" />
                <span>Sort by Ascending</span>
              </DropdownMenuItem>
            )}
            {(!sortingState || !sortingState.desc) && (
              <DropdownMenuItem
                className="flex gap-2"
                onClick={() => header.column.toggleSorting(true, true)}
              >
                <ArrowDown className="h-4 w-4" />
                <span>Sort by Descending</span>
              </DropdownMenuItem>
            )}
          </>
        )}
        {enableGrouping && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => header.column.toggleGrouping()}
            >
              <ListFilter className="h-4 w-4" />
              <span>{`Group by "${header.column.columnDef.header}"`} </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderMenu;
