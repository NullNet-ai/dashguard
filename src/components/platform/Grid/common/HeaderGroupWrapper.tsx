'use client';

import { ChevronDownIcon, X } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { type IState } from '../types';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { cn } from '~/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { GridContext } from '../Provider';

interface HeaderGroupWrapperProps {
  items: any[];
  state?: IState;
}

export const HeaderGroupWrapper = ({
  items,
  state,
}: HeaderGroupWrapperProps) => {
  const { actions } = useContext(GridContext);
  const [newItems, setNewItems] = useState(items);
  const parentRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleRemoveGroup = (columnId: string) => {
    const grouping = newItems
      ?.filter((item) => item.key !== columnId)
      .map((item) => item.key);
    actions?.handleUpdateGrouping(grouping);
  };

  useEffect(() => {
    const calc = (param_items?: any[]) => {
      const allItems: any[] = [];
      const newData = param_items || items;
      // clear width, more width, and search by
      let totalWidth = 0;
      const containerWidth = parentRef.current?.offsetWidth || 0;

      for (let index = 0; index < newData?.length; index++) {
        if (itemsRef.current[index]?.offsetWidth) {
          totalWidth += itemsRef.current[index].offsetWidth || 0;
          totalWidth += 4;
          if (totalWidth > containerWidth) {
            allItems?.push({
              key: newData[index],
              hidden: true,
            });
          } else {
            allItems?.push({
              key: newData[index],
              hidden: false,
            });
          }
        }
      }

      return allItems;
    };

    const handleResize = () => {
      const items = calc();

      if (JSON.stringify(items) !== JSON.stringify(newItems)) {
        setNewItems(items);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [items]);

  const getTotalWidthShownItems = useMemo(() => {
    let totalWidth = 0;
    newItems?.forEach((item, idx) => {
      if (!item?.hidden) {
        totalWidth += itemsRef.current[idx]?.offsetWidth || 0;
        totalWidth += 4;
      }
    });
    return totalWidth;
  }, [newItems, items]);

  if (!items?.length) return null;

  return (
    <div className="relative flex">
      <div
        ref={parentRef}
        className={cn(
          `header-table-grid flex w-[250px] flex-1 items-center gap-1`,
          `overflow-hidden`,
        )}
      >
        {items.map((columnId, index) => {
          const column = state?.table.getColumn(columnId);
          const isHidden = newItems?.[index]?.hidden;
          return (
            <div
              key={columnId}
              ref={(el) => {
                if (el) {
                  if (itemsRef.current) {
                    itemsRef.current[index] = el;
                  }
                }
              }}
              className={cn({ 'opacity-0': isHidden })}
            >
              <Badge
                borderRadius={'md'}
                variant="primary"
                className="flex items-center gap-1 px-2"
              >
                {column?.columnDef?.header as string}
                <X
                  className="h-3 w-3 cursor-pointer text-gray-400 hover:text-destructive"
                  onClick={() => {
                    if (!isHidden) {
                      handleRemoveGroup(columnId);
                      // column?.toggleGrouping();
                    }
                  }}
                />
              </Badge>
            </div>
          );
        })}
      </div>

      {/* dropdown */}
      {!!newItems?.length && newItems.some((item) => item.hidden) && (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger
            className="fborder absolute flex min-h-[24px] items-center gap-1 rounded-md border-transparent bg-primary/10 px-2 py-0.5 text-sm font-normal text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            data-test-id="apptab-ddn-btn"
            style={{
              left: `${getTotalWidthShownItems}px`,
            }}
          >
            <span>
              More{' '}
              <span className="font-semibold">
                ({newItems?.filter((itm) => itm.hidden)?.length})
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="pt-2"
            align="end"
            alignOffset={10}
            side="bottom"
          >
            {newItems
              ?.filter((dta) => dta.hidden)
              .map((itm, idx) => {
                const column = state?.table.getColumn(itm?.key);

                if (!itm.hidden) {
                  return null;
                }

                return (
                  <DropdownMenuItem
                    key={itm.name}
                    className={cn(
                      `group relative mb-1 flex w-fit items-center gap-1 rounded-md border border-transparent bg-primary/10 p-0 px-2 py-0.5 text-sm font-normal text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`,
                    )}
                  >
                    {column?.columnDef?.header as string}
                    <X
                      className="h-3 w-3 cursor-pointer text-gray-400 hover:text-destructive"
                      onClick={() => {
                        handleRemoveGroup(itm?.key);
                        // column?.toggleGrouping();
                      }}
                    />
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
