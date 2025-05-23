"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { forwardRef, useEffect } from "react";
import { createPortal } from "react-dom"; // Add this import

import { Badge } from "~/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";
import { toast } from 'sonner';
import { Button } from './button';

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}
type GroupOption = Record<string, Option[]>;

interface MultipleSelectorProps {
  value?: Option[] | string[];
  defaultOptions?: Option[];
  /** manually controlled options */
  options?: Option[];
  /** Use string values instead of Option objects */
  useStringValues?: boolean;
  placeholder?: string;
  /** Loading component. */
  loadingIndicator?: React.ReactNode;
  /** Empty component. */
  emptyIndicator?: React.ReactNode;
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number;
  /**
   * Only work with `onSearch` prop. Trigger search when `onFocus`.
   * For example, when user click on the input, it will trigger the search to get initial options.
   **/
  triggerSearchOnFocus?: boolean;
  /** async search */
  onSearch?: (value: string) => Promise<Option[]>;
  /**
   * sync search. This search will not showing loadingIndicator.
   * The rest props are the same as async search.
   * i.e.: creatable, groupBy, delay.
   **/
  onSearchSync?: (value: string) => Option[];
  onChange?: (options: Option[] | string[]) => void;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  /** Group the options base on provided key. */
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean;
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
  /** hide the clear all button. */
  hideClearAllButton?: boolean;
  onCreateRecord?: (value: string) => Promise<Option | undefined>;
  /** Show/hide the creatable item in the dropdown */
  showCreatableItem?: boolean;
  /** Custom render function for the selected option badges */
  renderBadge?: (option: Option, handleUnselect: (option: Option) => void) => React.ReactNode;
  /** Custom render function for dropdown options */
  renderOption?: (option: Option) => React.ReactNode;
}

export interface MultipleSelectorRef {
  selectedValue: Option[];
  input: HTMLInputElement;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      "": options,
    };
  }

  const groupOption: GroupOption = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || "";
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}
function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  // Deep clone the groupOption object
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption;

  // Iterate over the cloned object entries
  for (const [key, value] of Object.entries(cloneOption)) {
    // Ensure that the value is an array before filtering
    if (Array.isArray(value)) {
      cloneOption[key] = value.filter(
        (val) => !picked.find((p) => p.value === val.value),
      );
    } else {
      // If value is not an array, decide how to handle it
      cloneOption[key] = value;
    }
  }

  return cloneOption;
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p?.label?.toLowerCase() === option?.label?.toLowerCase()))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 **/
const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

const MultipleSelector = React.forwardRef<
  MultipleSelectorRef,
  MultipleSelectorProps
>(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      readOnly,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
      showCreatableItem = true,
      onCreateRecord,
      useStringValues = false,
      renderBadge,
      renderOption,
    }: MultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [onScrollbar, setOnScrollbar] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Convert string array to Option array if useStringValues is true
    const convertToOptions = React.useCallback((stringArray: string[]): Option[] => {
      return stringArray.map(str => ({ value: str, label: str }));
    }, []);

    // Convert Option array to string array if useStringValues is true
    const convertToStrings = React.useCallback((optionArray: Option[]): string[] => {
      return optionArray.map(opt => opt.value);
    }, []);

    // Initialize selected state based on value type
    const initialSelected = React.useMemo(() => {
      if (!value) return [];
      if (useStringValues && Array.isArray(value) && typeof value[0] === 'string') {
        return convertToOptions(value as string[]);
      }
      return value as Option[];
    }, []);

    const [selected, setSelected] = React.useState<Option[]>(initialSelected);
    const [options, setOptions] = React.useState<GroupOption>(
      transToGroupOption(arrayDefaultOptions, groupBy),
    );
    const [inputValue, setInputValue] = React.useState("");
    const [isCreateLoading, setIsCreateLoading] = React.useState(false);

    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    // Update portal container state
    const [portalElement, setPortalElement] = React.useState<HTMLElement | null>(null);
    
    // Create portal container once on component mount
    useEffect(() => {
      if (typeof document !== 'undefined') {
        // Check if container already exists
        let container = document.getElementById('multi-select-portal-container');
        
        if (!container) {
          container = document.createElement('div');
          container.id = 'multi-select-portal-container';
          document.body.appendChild(container);
        }
        
        setPortalElement(container);
        
        // Clean up on unmount
        return () => {
          // We don't remove the container as other instances might be using it
          // Just ensure we clean up our references
          setPortalElement(null);
        };
      }
    }, []);
    
    // Position calculation effect
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0, direction: 'bottom' });
    
    useEffect(() => {
      if (open && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        // Get the actual width of the Command element
        const commandWidth = dropdownRef.current.offsetWidth;
        
        // Calculate available space below and above
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // Estimated height of dropdown (can be adjusted)
        const estimatedDropdownHeight = 300;
        
        // Determine if dropdown should appear above or below
        const direction = spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow 
          ? 'top' 
          : 'bottom';
        
        setPosition({
          // If direction is 'top', position above the input, otherwise below
          top: direction === 'top' 
            ? rect.top + window.scrollY - 5 // 5px gap when above
            : rect.bottom + window.scrollY + 5, // 5px gap when below
          left: rect.left + window.scrollX,
          width: commandWidth,
          direction
        });
      }
    }, [open]);

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current!,
        focus: () => inputRef.current?.focus(),
      }),
      [selected],
    );

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    // Update handleUnselect to handle string values
    const handleUnselect = React.useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        if (useStringValues) {
          onChange?.(convertToStrings(newOptions));
        } else {
          onChange?.(newOptions);
        }
      },
      [onChange, selected, useStringValues, convertToStrings],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1];
              // If last item is fixed, we should not remove it.
              if (!lastSelectOption?.fixed) {
                handleUnselect([...selected].pop()!);
              }
            }
          }
          // This is not a default behavior of the <input /> field
          if (e.key === "Escape") {
            input.blur();
          }
        }
      },
      [handleUnselect, selected],
    );

    useEffect(() => {
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchend", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      };
    }, [open]);

    useEffect(() => {
      if (value) {
        if (useStringValues && Array.isArray(value) && typeof value[0] === 'string') {
          setSelected(convertToOptions(value as string[]));
        } else {
          setSelected(value as Option[]);
        }
      }
    }, [value, useStringValues, convertToOptions]);

    useEffect(() => {
      /** If `onSearch` is provided, do not trigger options updated. */
      if (!arrayOptions || onSearch) {
        return;
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption);
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

    useEffect(() => {
      /** sync search */

      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
      };

      const exec = async () => {
        if (!onSearchSync || !open) return;

        if (triggerSearchOnFocus) {
          doSearchSync();
        }

        if (debouncedSearchTerm) {
          doSearchSync();
        }
      };

      exec();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    useEffect(() => {
      /** async search */

      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };

      const exec = async () => {
        if (!onSearch || !open) return;

        if (triggerSearchOnFocus) {
          await doSearch();
        }

        if (debouncedSearchTerm) {
          await doSearch();
        }
      };

      exec();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    const CreatableItem = () => {
      if (!creatable) return undefined;  // Modified this line
      if (isOptionsExist(options, [{ value: inputValue, label: inputValue }])) {
        return undefined;
      }
      const Item = (
        <CommandItem
          value={inputValue}
          className={cn("cursor-pointer px-3 py-2  !bg-primary !text-primary-foreground  font-bold text-md",
            showCreatableItem
              ? "" : "hidden"
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSelect={async (value: string) => {
            const optionExists = Object.values(options).some(group =>
              group.some(opt => opt.label === inputValue)
            );

            const alreadySelected = selected.some(opt => opt.label === inputValue);

            if (optionExists || alreadySelected) {
                toast.error("Value already exists or is already selected", {
                richColors: true,
                description: "Please select a different value or create a new one",
                descriptionClassName: "text-sm !text-red-400",
                className: "p-3",
                });
              return;
            }

            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }

            let newRecord = { value, label: value };
            if (onCreateRecord) {
              setIsCreateLoading(true);
              const result = await onCreateRecord?.(value);
              if (!result) {
                setIsCreateLoading(false);
                return;
              }
              newRecord = result;
            }

            setInputValue("");
            const newOptions = [...selected, newRecord];
            setSelected(newOptions);

            
            // Handle useStringValues when creatable is true
            if (useStringValues) {
              onChange?.(convertToStrings(newOptions));
            } else {
              onChange?.(newOptions);
            }
            setIsCreateLoading(false);
          }}
        >
          {isCreateLoading ? "Creating..." : `Create "${inputValue}"`}
        </CommandItem>
      );

      // For normal creatable
      if (!onSearch && inputValue.length > 0) {
        return Item;
      }

      // For async search creatable. avoid showing creatable item before loading at first.
      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item;
      }

      return undefined;
    };

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;

      // For async search that showing emptyIndicator
      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        );
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
    }, [creatable, emptyIndicator, onSearch, options]);

    const selectables = React.useMemo<GroupOption>(
      () => removePickedOption(options, selected),
      [options, selected],
    );

    /** Avoid Creatable Selector freezing or lagging when paste a long string. */
    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter;
      }

      // Using default filter in `cmdk`. We don't have to provide it.
      return undefined;
    }, [creatable, commandProps?.filter]);


    return (
      <Command
        ref={dropdownRef}
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn(
          "h-auto overflow-visible bg-background w-full",
          commandProps?.className,
        )}
        shouldFilter={
          commandProps?.shouldFilter !== undefined
            ? commandProps.shouldFilter
            : !onSearch
        } // When onSearch is provided, we don't want to filter the options. You can still override it.
        filter={commandFilter()}
      >
        <div
          className={cn(
            "min-h-[26px]  rounded-md border border-gray-300 text-sm relative flex items-center",
            {
              "px-2": selected.length !== 0,
              "cursor-text": !disabled && selected.length !== 0,
            },
            className,
          )}
          onClick={() => {
            if (disabled) return;
            inputRef.current?.focus();
          }}
        >
          <div className={"flex flex-wrap items-center gap-1 py-[5px]"}>
            {selected.map((option) => {
              return renderBadge ? (
                <React.Fragment key={option.value}>
                  {renderBadge(option, handleUnselect)}
                </React.Fragment>
              ) : (
                <Badge
                  key={option.value}
                  className={cn(
                    "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                    "max-h-6 min-h-6 data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground ",
                    "",
                    badgeClassName,
                  )}
                  data-fixed={option.fixed}
                  data-disabled={disabled || undefined}
                >
                  {option.label}
                  <Button
                    className={cn(
                      "ml-1 rounded-full outline-none bg-transparent !p-0 h-fit",
                      (disabled || option.fixed) && "hidden",
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <XMarkIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </Button>
                </Badge>
              );
            })}
            {/* Avoid having the "Search" Icon */}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              readOnly={readOnly}
              onValueChange={(value) => {
                setInputValue(value);
                inputProps?.onValueChange?.(value);
              }}
              onBlur={(event) => {
                if (!onScrollbar) {
                  setOpen(false);
                }
                inputProps?.onBlur?.(event);
              }}
              onFocus={(event) => {
                setOpen(true);
                (triggerSearchOnFocus && onSearch?.(debouncedSearchTerm));
                inputProps?.onFocus?.(event);
              }}
              placeholder={
                hidePlaceholderWhenSelected && selected.length !== 0
                  ? ""
                  : placeholder
              }
              className={cn(
                "flex-1 bg-transparent outline-none placeholder:text-muted-foreground static  !py-0",
                {
                  "w-full": hidePlaceholderWhenSelected,
                  "px-2": selected.length === 0,
                  "ml-1": selected.length !== 0,
                },
                inputProps?.className,
              )}
            />
            <button
              type="button"
              onClick={() => {
                setSelected(selected.filter((s) => s.fixed));
                onChange?.(selected.filter((s) => s.fixed));
              }}
              className={cn(
                "absolute right-2 h-5 w-5 p-0",
                (hideClearAllButton ||
                  disabled ||
                  selected.length < 1 ||
                  selected.filter((s) => s.fixed).length === selected.length) &&
                "hidden",
              )}
            >
              <XMarkIcon />
            </button>
          </div>
        </div>
        <div className={`relative`}>
        {open && portalElement && createPortal(
            <CommandList
              className={cn(
                "absolute z-[9999] w-full rounded-md bg-background text-sidebar-foreground outline-none animate-in py-0 text-base shadow-lg ring-1 ring-black/5 focus:outline-none px-0",
              )}
              onMouseLeave={() => {
                setOnScrollbar(false);
              }}
              onMouseEnter={() => {
                setOnScrollbar(true);
              }}
              onMouseUp={() => {
                inputRef.current?.focus();
              }}
              style={{
                width: `${position.width}px`, // Ensure exact width match
                minWidth: `${position.width}px`, // Add minWidth to prevent shrinking
                top: position.direction === 'top' 
                  ? 'auto' // Use auto when positioned above
                  : `${position.top}px`,
                bottom: position.direction === 'top' 
                  ? `${window.innerHeight - position.top}px` // Calculate from bottom when above
                  : 'auto',
                left: `${position.left}px`,
                maxHeight: '240px',
                overflowY: 'auto',
                transformOrigin: position.direction === 'top' ? 'bottom' : 'top'
              }}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  {EmptyItem()}
                  {CreatableItem()}
                  {!selectFirstItem && (
                    <CommandItem value="-" className="hidden" />
                  )}
                  {Object.entries(selectables).map(([key, dropdowns]) => (
                    <CommandGroup
                      key={key}
                      heading={key}
                      className=" max-h-60 w-full h-full overflow-auto "
                    >
                      <>
                        {(dropdowns).map((option) => {
                          return (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              disabled={option.disable}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onSelect={() => {
                                if (selected.some(s => s.value === option.value)) {
                                  toast.error("Option already selected", {
                                    className: "p-2",
                                    description: "Please select another option",
                                    richColors: true,
                                  });
                                  return;
                                }

                                if (selected.length >= maxSelected) {
                                  onMaxSelected?.(selected.length);
                                  return;
                                }
                                setInputValue("");
                                const newOptions = [...selected, option];
                                setSelected(newOptions);
                                if (useStringValues) {
                                  onChange?.(convertToStrings(newOptions));
                                } else {
                                  onChange?.(newOptions);
                                }
                              }}
                              className={cn(
                                "cursor-pointer !text-md",
                                option.disable &&
                                "cursor-default text-sidebar-foreground ",
                              )}
                            >
                              {renderOption ? renderOption(option) : option.label}
                            </CommandItem>
                          );
                        })}
                      </>
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>,
            portalElement
          )}
        </div>
      </Command>
    );
  },
);

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;
