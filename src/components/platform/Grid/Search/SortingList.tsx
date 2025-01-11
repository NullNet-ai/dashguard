"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { SearchGridContext } from "./Provider";
import { cn, formatAndCapitalize } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { testIDFormatter } from "~/utils/formatter";
import { v } from "node_modules/@faker-js/faker/dist/airline-BnpeTvY9";
import DropResult from "./DropResult";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const SortingList = () => {
  const containerRef = useRef<any>(null);
  const innerRef = useRef<any>(null);
  const itemsRef = useRef<any[]>([]);
  const { state, actions } = useContext(SearchGridContext);

  const { searchItems = [] } = state ?? {};
  const selectedSearchItems = searchItems?.filter((item) => !item?.default);

  const [visibleItems, setVisibleItems] = useState<any[]>(selectedSearchItems);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const calculateWidths = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const inner  = innerRef.current?.offsetWidth || 0;
      let totalWidth = 130;
      const visible: string[] = [];

      visibleItems.forEach((item, index) => {
        const itemWidth = itemsRef.current[index]?.offsetWidth || 0;
        if (totalWidth + itemWidth <= containerWidth) {
          visible.push(item);
        }
        totalWidth += itemWidth;
      });

      setVisibleItems(visible);
    };
    const timeout = setTimeout(() => {
      calculateWidths();
    }, 1000);

    const handleResize = () => {
      calculateWidths();
    };

    if (
      innerRef.current?.offsetWidth > containerRef.current?.offsetWidth
    ) {
        console.log("first", innerRef.current?.offsetWidth , containerRef.current?.offsetWidth)
      calculateWidths();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [searchItems, itemsRef?.current, innerRef.current]);

  const hiddenItems = useMemo(() => {
    const items = searchItems?.filter(
      (item) => !visibleItems.some((sel) => sel.id === item.id),
    );

    return items.filter((item) => item.type !== "operator");
  }, [visibleItems]);

  console.log("hiddenItems", hiddenItems);

  return (
    <div
      className="flex flex-col items-center gap-2 md:flex-row"
      ref={containerRef}
    >
      <div className="flex flex-row items-center gap-1" ref={innerRef}>
        <span
          className={cn(
            `whitespace-nowrap text-xs text-black`,
            `${selectedSearchItems.length ? "" : "mt-[12px]"}`,
          )}
        >
          Search By:{" "}
        </span>
        {selectedSearchItems.length > 0 && (
          <div className="flex flex-nowrap py-1">
            {searchItems?.map((item, index) => {
              if (item.type === "operator" || index === 0) {
                return null;
              }
              return (
                <Badge
                  key={item.id}
                  variant="secondary"
                  className="m-1 flex items-center gap-1 whitespace-nowrap"
                  ref={(el: any) => (itemsRef.current[index] = el)}
                >
                  {item.type === "criteria"
                    ? `${item?.label || formatAndCapitalize(item?.field ?? "")} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                    : item?.operator}
                  {item.type === "criteria" && !item.default && (
                    <Button
                      variant="ghost"
                      size="xs"
                      name="removeSortingButton"
                      key={`${item.id}-remove`}
                      className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                      onClick={() => {
                        actions?.handleRemoveSearchItem(item);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              );
            })}
            {hiddenItems?.length ? (
              <div className="py-1">
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
                      More ({hiddenItems?.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom">
                    <div className="flex flex-col gap-1">
                    {hiddenItems?.map((item, index) => {
                      return (
                          <Badge
                            key={item.id}
                            variant="secondary"
                            className="flex items-center gap-1 whitespace-nowrap self-start"
                            ref={(el: any) => (itemsRef.current[index] = el)}
                          >
                            {item.type === "criteria"
                              ? `${item?.label || formatAndCapitalize(item?.field ?? "")} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                              : item?.operator}
                            {item.type === "criteria" && !item.default && (
                              <Button
                                variant="ghost"
                                size="xs"
                                name="removeSortingButton"
                                key={`${item.id}-remove`}
                                className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                                onClick={() => {
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
            ) : null}

            <Button
              name="resetSortButton"
              variant={"link"}
              className="h-[30px] text-default/60 underline hover:no-underline"
              onClick={() => {
                //
              }}
            >
              Clear All
            </Button>
          </div>
        )}
        {/* {defaultSearchItems?.map((item) => (
        <Badge key={item.id} variant="primary" className="m-2 mx-1">
          {item.type === "criteria"
            ? `${item?.label || formatAndCapitalize(item?.field ?? "")} is ${item?.display_value || item?.values?.[0]}`
            : item?.operator}
        </Badge>
      ))} */}
      </div>
    </div>
  );
};

export default SortingList;
