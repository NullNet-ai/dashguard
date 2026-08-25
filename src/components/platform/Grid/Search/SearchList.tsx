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

import { GridContext } from '../Provider';

import LiveSearch from './LiveSearch';
import { SearchGridContext } from './Provider';
import SearchDialog from './SearchDialog';
import { usePathname } from 'next/navigation'
import { testIDFormatter } from '~/utils/formatter'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

//funtion to ellipse the text if it is too long
const shortentext = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
}

const SearchList = ({parentType} : any) => {
  const conref = useRef<any>(null);
  const itemsRef = useRef<any[]>([]);
  const { state, actions } = useContext(SearchGridContext);
  const { state: gridConfigState } = useContext(GridContext);
  // WP-828 — opt-in live search replaces the default modal on the grids that ask for it.
  const isLiveSearch = gridConfigState?.config?.searchMode === 'live';
  const path =  usePathname()
  const [, , path1, path2] = path.split('/')

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
    const debounce = <T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ): ((...args: Parameters<T>) => void) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };
  
    const arraysEqual = (arr1: any[], arr2: any[]) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((item, index) => 
        item.id === arr2[index]?.id && item.hidden === arr2[index]?.hidden
      );
    };
  
    const calc = (items?: any[]) => {
      const allItems: any[] = [];
      const newData = items || defaultSearchItems?.filter((item: any) => item.type !== 'operator');
      
      if (!newData?.length || !conref.current) return [];
      
      const containerWidth = conref.current.offsetWidth;
      const clearWidth = 65 + 63 + 61 + 79;
      let totalWidth = 32 + newData.length * 2 + 5 + clearWidth;
      
      const styleUpdates: Array<{ element: HTMLElement; styles: { position: string; left: string; pointerEvents: string } }> = [];
      
      for (let index = 0; index < newData.length; index++) {
        const element = itemsRef.current[index];
        if (!element?.offsetWidth) continue;
        
        const isInMainContainer = element.closest('.container-ref');
        if (!isInMainContainer) continue;
        
        totalWidth += element.offsetWidth;
        const isHidden = totalWidth > containerWidth;
        
        allItems.push({
          ...newData[index],
          hidden: isHidden,
        });
        
        if (element) {
          styleUpdates.push({
            element,
            styles: isHidden
              ? { position: 'absolute', left: '-150px', pointerEvents: 'none' }
              : { position: 'relative', left: 'auto', pointerEvents: 'auto' }
          });
        }
      }
      
      styleUpdates.forEach(({ element, styles }) => {
        Object.assign(element.style, styles);
      });
      
      const visibleCount = allItems.filter(item => !item.hidden).length;
      if (visibleCount === 0 && allItems.length > 0) {
        allItems[0].hidden = false;
        const firstElement = itemsRef.current[0];
        if (firstElement) {
          Object.assign(firstElement.style, {
            position: 'relative',
            pointerEvents: 'auto',
            left: 'auto'
          });
        }
      }
      
      return allItems;
    };
  
    const handleResize = debounce(() => {
      const items = calc();
      if (!arraysEqual(items, data) && !open) {
        setData(items);
      }
    }, 150);
  
    handleResize();
    
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [defaultSearchItems, open, data]);

  // if (parentType !== 'grid') {
  //   return null
  // }

  return (
    <div
      className={cn(`container-ref relative flex flex-col items-center gap-2 overflow-hidden md:flex-row`)}
      ref={conref}
    >
      
      <div className='flex flex-row justify-between flex-1 items-center'>
      {defaultSearchItems.length ?   <div className="flex flex-row items-center flex-1 gap-x-[5px] max-w-[387px]">
          <span
            className={cn(
              `whitespace-nowrap text-xs text-black`,
              `${selectedSearchItems.length ? '' : 'mt-[4px]'}`,
            )}
            data-test-id={`${testIDFormatter(`${path1}-${path2}-srch-by-lbl`)}`}
          >
            Search By: 
          </span>
          {defaultSearchItems.length ? (
            <div className="relative flex flex-nowrap items-center gap-x-[5px]">
              {defaultSearchItems?.map((item: any, index: number) => {
                const isHidden = data?.[index]?.hidden;
                const searchText = shortentext(
                  item.type === 'criteria'
                  ?  `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                  : item?.operator, 
                  (path2 === 'record' || path2 === 'wizard') ? 10 : 25,
                )
                 const pillLabel = item.label?.toLowerCase().replace(/\s+/g, '-');
                return (
                      <TooltipProvider key={index}>
                        <Tooltip delayDuration={100} defaultOpen={false}>
                          <TooltipTrigger asChild>
                            <Badge
                              className={cn(
                                `item-ref my-1 flex items-center whitespace-nowrap`,
                                { 'opacity-0': isHidden },
                              )}
                              data-test-id={`${testIDFormatter(`${path1}-${path2}-srch-by-pill-${pillLabel}`)}`}
                              key={item.id}
                              ref={(el) => {
                                if (el) {
                                  itemsRef.current[index] = el;
                                }
                              }}
                              variant="secondary"
                            >
                              {searchText}
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
                          </TooltipTrigger>
                          <TooltipContent side="top" align='end'>
                            {
                              item.type === 'criteria'
                              ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                              : item?.operator
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                
                );
              })}
              {!!data?.length && data.some((item) => item.hidden) && (
                <div
                  className="max-w-[63px]"
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
                      <div className="flex flex-col gap-1 gap-y-2 py-2 px-2">
                        {data?.map((item, index) => {
                          if (
                            !item.hidden ||
                            item.type === 'operator' ||
                            index === 0
                          ) {
                            return null;
                          }

                           const searchText = shortentext(
                              item.type === 'criteria'
                              ?  `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                              : item?.operator, 
                              (path2 === 'record' || path2 === 'wizard') ? 50 : 50,
                            )

                          return (
                               <TooltipProvider key={index}>
                                <Tooltip delayDuration={100} defaultOpen={false}>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      className="flex items-center gap-1 self-start whitespace-nowrap"
                                      key={item.id}
                                      ref={(el: any) => (itemsRef.current[index] = el)}
                                      variant="secondary"
                                    >
                                      {searchText}
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
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align='end'>
                                    {
                                      item.type === 'criteria'
                                      ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                                      : item?.operator
                                    }
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
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
                  `${data?.length && data.some((item) => item.hidden) ? 'mt-[2px]' : ''}`,
                )}
                name="resetSearchButton"
                variant="link"
                onClick={() => {
                  actions?.handleClearSearchItems();
                }}
              >
                Clear All
              </Button>
            </div>
          ) : null}
        </div> : <div></div>}
        <div>
         {isLiveSearch ? <LiveSearch /> : <SearchDialog />}
        </div>
      </div>
    </div>
  );
};

export default SearchList;
