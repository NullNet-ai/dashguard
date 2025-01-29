"use client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ColumnSort } from "@tanstack/react-table";
import { Trash2, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { cn, formatAndCapitalize } from "~/lib/utils";
import { testIDFormatter } from "~/utils/formatter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const Sorting = () => {
  const conref = useRef<any>(null);
  const itemsRef = useRef<any[]>([]);
  const { state, actions } = useContext(GridContext);


  const entity = state?.config?.entity;

  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const getLabel = (id: string) => {
    const column = state?.config?.columns.find(
      (col: any) => col.accessorKey === id,
    );
    return column?.header || formatAndCapitalize(id);
  };

  useEffect(() => {
    const calc = (items?: any[]) => {
      const allItems: any[] = [];
      const newData = items || state?.sorting || [];

      const clearWidth = 65 + 63 + 42; // clear width, more width, and sort by
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
    if (document.readyState === "complete") {
      handleResize()
    } else {
      window.addEventListener("load", handleResize);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleResize);
    };
  }, [state?.sorting, open]);

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
  }, [data, state?.sorting, itemsRef.current]);

  if (!state?.sorting?.length) return null;

  return (
    <div
      className="sort-ref flex w-full flex-1 items-center overflow-hidden"
      ref={conref}
    >
      <span className="text-nowrap text-xs text-foreground">Sort By</span>
      {state?.sorting?.map((item: ColumnSort, index) => {
        const isHidden = data?.[index]?.hidden;
        return (
          <Badge
            key={item.id}
            variant="secondary"
            className={cn(
              `item-ref m-1 flex items-center gap-1 whitespace-nowrap`,
              { "opacity-0": isHidden },
            )}
            ref={(el) => {
              if (el) {
                itemsRef.current[index] = el;
              }
            }}
          >
            {getLabel(item.id) as string} ({item.desc ? "Desc" : "Asce"})
            <Button
              variant="ghost"
              size="xs"
              name="removeSortingButton"
              data-test-id={testIDFormatter(`${entity}-remove-sorting-btn`)}
              key={`${item.id}-remove`}
              className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
              onClick={() => {
                actions?.handleRemoveSorting(item.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}
      {data?.length && data.some((item) => item.hidden) ? (
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
              asChild
              onClick={() => {
                setOpen(!open);
              }}
            >
              <Button
                variant="outline"
                size="xs"
                name="removeSortingButton"
                className="h-[24px] w-auto text-nowrap bg-muted px-2 text-default/70 hover:bg-transparent focus:outline-none"
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
                  if (!item.hidden) {
                    return null;
                  }
                  return (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className="flex items-center gap-1 whitespace-nowrap self-start"
                      ref={(el: any) => (itemsRef.current[index] = el)}
                    >
                     {getLabel(item.id) as string} ({item.desc ? "Desc" : "Asce"})
                       <Button
                          variant="ghost"
                          size="xs"
                          name="removeSortingButton"
                          key={`${item.id}-remove`}
                          className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                          onClick={() => {
                            actions?.handleRemoveSorting(item.id);
                            setOpen(false);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
      <Button
        name="resetSortButton"
        variant={"link"}
        style={{
          left: lastHiddenIndexLeftPos ? lastHiddenIndexLeftPos + 63 : 0,
        }}
        className={cn(
          `h-[30px] text-default/60 underline hover:no-underline`,
          `${data?.length && data.some((item) => item.hidden) ? "absolute mt-[2px]" : ""}`,
        )}
        onClick={() => {
          // platform dev will add this
        }}
      >
        <Trash2 className="size-4 block lg:hidden"/>
        <span className="hidden md:block">Clear All</span>
      </Button>
    </div>
  );
};

export default Sorting;
