'use client';

import { X } from 'lucide-react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn, formatAndCapitalize } from '~/lib/utils';

import { SearchGridContext } from './Provider';
import SearchDialog from './SearchDialog';

const SearchList = ({parentType} : any) => {
  const conref = useRef<any>(null);
  const itemsRef = useRef<any[]>([]);
  const { state, actions } = useContext(SearchGridContext);

  const { searchItems = [] } = state ?? {};
  const displaySearchItemResolver = searchItems.reduce((acc: any, item) => {
    if (!item.filters || !Array.isArray(item.filters)) {
      acc.push(item);
    } else {
      acc.push(...item.filters);
    }
    return acc;
  }, []);


  const selectedSearchItems = displaySearchItemResolver?.filter(
    (item: any) => !item?.default,
  );
  const defaultSearchItems = selectedSearchItems
  ?.map((item: any) => ({ ...item, hidden: false }))
  .filter((itm: any) => itm.type !== 'operator')
  .filter((item: any, index: number, self: any) =>
    index === self.findIndex((t: any) =>
      t.entity === item.entity &&
      t.field === item.field &&
      JSON.stringify(t.values) === JSON.stringify(item.values)
    )
  );



  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const calc = (items?: any[]) => {
      const allItems: any[] = [];
      const newData =
        items ||
        defaultSearchItems?.filter((item: any) => item.type !== 'operator');
      // clear width, more width, and search by
      const clearWidth = 65 + 63 + 61;
      let totalWidth = 32 + newData?.length * 2 + 5 + clearWidth;
      const containerWidth = conref.current?.offsetWidth || 0;

      for (let index = 0; index < newData.length; index++) {
        if (itemsRef.current[index]?.offsetWidth) {
          totalWidth += itemsRef.current[index].offsetWidth || 0;
          if (totalWidth > containerWidth) {
            allItems?.push({
              ...newData[index],
              hidden: true,
            });
          } else {
            allItems?.push({
              ...newData[index],
              hidden: false,
            });
          }
        }
      }
      return allItems;
    };

    const handleResize = () => {
      const items = calc();
      if (JSON.stringify(items) !== JSON.stringify(data) && !open) {
        setData(items);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [defaultSearchItems, open]);

  const lastHiddenIndexLeftPos = useMemo(() => {
    const lastIndex = data?.findIndex((item) => item.hidden);
    if (lastIndex === -1) {
      return null;
    }
    return (
      itemsRef.current[lastIndex - 1]?.offsetLeft +
      itemsRef.current[lastIndex - 1]?.offsetWidth +
      5
    );
  }, [data, defaultSearchItems, itemsRef.current]);

  if (parentType !== 'grid') {
    return null
  }

  return (
    <div
      className={cn(`container-ref relative flex flex-col items-center gap-2 overflow-hidden md:flex-row`)}
      ref={conref}
    >
      <div className='flex flex-row justify-between flex-1 items-center'>
        <div className="flex flex-row items-center flex-1 max-w-[578px]">
          <span
            className={cn(
              `whitespace-nowrap text-xs text-black`,
              `${selectedSearchItems.length ? '' : 'mt-[4px]'}`,
            )}
          >
            Search By:
          </span>
          {defaultSearchItems.length ? (
            <div className="flex flex-nowrap py-1">
              {defaultSearchItems?.map((item: any, index: number) => {
                const isHidden = data?.[index]?.hidden;
                return (
                  <Badge
                    className={cn(
                      `item-ref m-1 flex items-center gap-1 whitespace-nowrap`,
                      { 'opacity-0': isHidden },
                    )}
                    key={item.id}
                    ref={(el) => {
                      if (el) {
                        itemsRef.current[index] = el;
                      }
                    }}
                    variant="secondary"
                  >
                    {item.type === 'criteria'
                      ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                      : item?.operator}
                    {item.type === 'criteria' && !item.default && (
                      <Button
                        className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                        key={`${item.id}-remove`}
                        name="removeSortingButton"
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          if (isHidden) return;
                          actions?.handleRemoveSearchItem(item);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Badge>
                );
              })}
              {!!data?.length && data.some((item) => item.hidden) && (
                <div
                  className="absolute max-w-[63px] py-1"
                  style={{
                    left: lastHiddenIndexLeftPos,
                  }}
                >
                  <DropdownMenu
                    open={open}
                    onOpenChange={(isOpen) => {
                      setOpen(isOpen);
                    }}
                  >
                    <DropdownMenuTrigger
                      asChild={true}
                      onClick={() => {
                        setOpen(!open);
                      }}
                    >
                      <Button
                        className="h-[24px] w-auto text-nowrap bg-muted px-2 text-default/70 hover:bg-transparent focus:outline-none"
                        name="removeSortingButton"
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          //
                        }}
                      >
                        More ({data.filter((d) => d.hidden)?.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom">
                      <div className="flex flex-col gap-1 gap-y-2 py-1">
                        {data?.map((item, index) => {
                          if (
                            !item.hidden ||
                            item.type === 'operator' ||
                            index === 0
                          ) {
                            return null;
                          }
                          return (
                            <Badge
                              className="flex items-center gap-1 self-start whitespace-nowrap"
                              key={item.id}
                              ref={(el: any) => (itemsRef.current[index] = el)}
                              variant="secondary"
                            >
                              {item.type === 'criteria'
                                ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                                : item?.operator}
                              {item.type === 'criteria' && !item.default && (
                                <Button
                                  className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                                  key={`${item.id}-remove`}
                                  name="removeSortingButton"
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => {
                                    setData((prev) =>
                                      prev.filter(
                                        (prevData) => prevData.id !== item.id,
                                      ),
                                    );
                                    actions?.handleRemoveSearchItem(item);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <Button
                className={cn(
                  `h-[30px] text-default/60 underline hover:no-underline`,
                  `${data?.length && data.some((item) => item.hidden) ? 'absolute mt-[2px]' : ''}`,
                )}
                name="resetSortButton"
                style={{
                  left: lastHiddenIndexLeftPos
                    ? lastHiddenIndexLeftPos + 63
                    : 0,
                }}
                variant="link"
                onClick={() => {
                  actions?.handleClearSearchItems();
                }}
              >
                Clear All
              </Button>
            </div>
          ) : null}
        </div>
        <div className='mt-1'>
         <SearchDialog />
        </div>
      </div>
    </div>
  );
};

export default SearchList;
