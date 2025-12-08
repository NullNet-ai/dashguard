'use client';

import * as React from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { cn } from '~/lib/utils';

interface DropdownItem {
  id: number;
  name: string;
}

interface DropdownCustomProps {
  data: DropdownItem[];
  selectedIndex: number | null;
  onSelectionChange: (index: number | null) => void;
  onItemUpdate: (index: number, newName: string) => void;
  onItemDelete?: (index: number) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  variant?: 'border' | 'underline' | 'none';
  optionClassName?: string;
  isSearchable?: boolean;
  highlightSelection?: boolean;
  renderOption?: (item: DropdownItem, isSelected: boolean) => React.ReactNode;
  maxVisibleItems?: number;
  renameValidationMessage?: string;
  maxRenameLength?: number;
  itemClassName?: string;
}

const DropdownCustom: React.FC<DropdownCustomProps> = ({
  data,
  selectedIndex,
  onSelectionChange,  
  onItemUpdate,
  onItemDelete,
  placeholder = "Create option...",
  label,
  className,
  variant = 'border',
  optionClassName,
  isSearchable = false,
  highlightSelection = true,
  renderOption,
  maxVisibleItems = 5,
  renameValidationMessage = "Name cannot be empty",
  maxRenameLength = 50,
  itemClassName
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editValue, setEditValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const filteredData = React.useMemo(() => {
    return searchQuery === ''
      ? data
      : data.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
  }, [data, searchQuery]);

  const selected = React.useMemo(() => {
    return selectedIndex !== null ? data[selectedIndex] : null;
  }, [selectedIndex, data]);

  const handleUpdateItem = React.useCallback(() => {
    // Clear previous validation errors
    setValidationError(null);

    // Validate: Don't accept empty values
    if (!editValue.trim()) {
      setValidationError(renameValidationMessage);
      return;
    }

    // Validate: Check max length
    if (editValue.trim().length > maxRenameLength) {
      setValidationError(`Name cannot exceed ${maxRenameLength} characters`);
      return;
    }

    if (selectedIndex === null) {
      return;
    }

    // Validate: Don't accept if already exists in array (excluding current item)
    const isDuplicate = data.some(
      (item, index) =>
        item.name.toLowerCase() === editValue.trim().toLowerCase() &&
        index !== selectedIndex,
    );

    if (isDuplicate) {
      setValidationError('Name already exists');
      return;
    }

    const trimmedValue = editValue.trim();
    onItemUpdate(selectedIndex, trimmedValue);
    
    setIsOpen(false);
    setIsEditing(false);
    setEditValue('');
    setValidationError(null);
  }, [editValue, selectedIndex, data, onItemUpdate, renameValidationMessage, maxRenameLength]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleUpdateItem();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setIsEditing(false);
      setEditValue('');
      setValidationError(null);
    }
  }, [handleUpdateItem]);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setIsOpen(true);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  }, [validationError]);

  const handleSelectionChange = React.useCallback((value: DropdownItem | null) => {
    // Don't change selection if we're currently editing
    if (isEditing) {
      return;
    }
    
    const index = value ? data.findIndex(item => item.id === value.id) : null;
    onSelectionChange(index !== -1 ? index : null);
    setSearchQuery('');
    setEditValue('');
    setIsOpen(false);
  }, [data, onSelectionChange, isEditing]);

  const handleDelete = React.useCallback(() => {
    setIsOpen(false);
    setIsEditing(false);
    setEditValue('');
    setValidationError(null);
  }, [selectedIndex, onItemDelete, onSelectionChange]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
        setEditValue('');
        setValidationError(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Force dropdown to stay open during edit m


  let variantClasses = 'rounded-md !border !border-slate-300 bg-slate-50';

  switch (variant) {
    case 'underline':
      variantClasses = 'border-b border-slate-300';
      break;
    case 'none':
      variantClasses = 'focus:ring-0 focus:border-none focus:outline-none';
      break;
    default:
      break;
  }


  return (
    <div ref={dropdownRef} className={cn("space-y-2 max-w-[300px]", className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
      <Combobox
        value={selected}
        onChange={handleSelectionChange}
      >
        <div className="relative !mt-0">
          {(selected && !isEditing || !selected) ? (
            <div
              className={cn("flex h-[36px] f gap-2 w-full cursor-pointer items-center justify-between  px-3 py-2 transition-colors hover:bg-slate-100", variantClasses)}
              onDoubleClick={() => {
                if (selected) {
                  setIsEditing(true);
                  setIsOpen(true);
                  setEditValue(selected.name);
                }
              }}
              onClick={() => {
               setIsOpen(!isOpen);
              }}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <div className="flex items-center w-full gap-x-3">
                <div className=' w-[90%]'>
                  <div className="text-slate-700 truncate">
                    {selected ? selected?.name : placeholder}
                  </div>
                </div>
                <div>
                  {!isOpen ? (
                    <ChevronDown className="size-5 text-slate-500" />
                  ) : (
                    <ChevronUp className="size-5 text-slate-500" />
                  )}
                </div>
              </div>
            
            </div>
          ) : (
            <div className={cn("flex overflow-hidden rounded-md  bg-transparent pr-4 text-slate-700 placeholder:text-muted-foreground focus:border-primary focus:ring-primary", variantClasses)}>
              <input
                className="h-[36px] w-full flex-1 border-none ring-0  outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                // displayValue={(item: DropdownItem | null) => {
                //   if (isEditing) {
                //     return editValue;
                //   }
                //   return item?.name || '';
                // }}
                value={isEditing ? editValue : selected?.name || ''}
                onChange={(event) => {
                  if (isEditing) {
                    setEditValue(event.target.value);
                    // Keep dropdown open when editing
                    setIsOpen(true);
                    // Clear validation error when user starts typing
                    if (validationError) {
                      setValidationError(null);
                    }
                  }
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (!isEditing) {
                    setIsOpen(true);
                  }
                }}
                maxLength={maxRenameLength}
                onBlur={(event) => {
                  // In edit mode, only close if clicking outside the entire dropdown component
                  if (isEditing) {
                    const relatedTarget = event.relatedTarget as HTMLElement;
                    const isClickingOutside = !dropdownRef.current?.contains(relatedTarget);
                    
                    if (isClickingOutside) {
                      setTimeout(() => {
                        setIsOpen(false);
                        setIsEditing(false);
                        setEditValue('');
                        setValidationError(null);
                      }, 200);
                    }
                  } else {
                    // Normal behavior when not editing
                    const relatedTarget = event.relatedTarget as HTMLElement;
                    const isClickingOnDropdown = dropdownRef.current?.contains(relatedTarget);
                    
                    if (!isClickingOnDropdown) {
                      setTimeout(() => {
                        setIsOpen(false);
                      }, 200);
                    }
                  }
                }}
                placeholder={placeholder}
              />
              
              {(selected || isEditing) ? (
                <div className="relative z-[60] flex items-center gap-2 text-xs font-medium text-slate-400">
                  <button
                    className="group"
                    onClick={handleUpdateItem}
                  >
                    <CheckIcon className="size-4 text-success group-hover:text-success/30" />
                  </button>
                  {onItemDelete && selected && (
                    <button className="group" onClick={handleDelete}>
                      <X className="size-4 text-danger group-hover:text-danger/30" />
                    </button>
                  )}
                </div>
              ): null }
            </div>
          )}

          {/* Validation Error Display */}
          {validationError && (
            <div className="mt-1 text-sm text-red-500">
              {validationError}
            </div>
          )}

          {isOpen && (
            <div className={cn("absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg", optionClassName)}>
              {/* Search Input */}
              {isSearchable && (
                <div className="p-2 border-b border-border">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
                     <input
                       type="text"
                       className="w-full pl-10 pr-3 py-2 text-md border-slate-300 border rounded-md focus:outline-none focus:ring-0   transition-colors"
                       placeholder="Search..."
                       value={searchQuery}
                       onChange={handleSearchChange}
                       onKeyDown={handleKeyDown}
                     />
                   </div>
                 </div>
              )}
              
              {/* Options List */}
              <ComboboxOptions
                className={cn("overflow-auto pointer-events-none")}
                style={{
                  maxHeight: `${maxVisibleItems * 45}px`
                }}
                static
              >
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const isSelected = selected?.id === item.id;
                    return (
                      <ComboboxOption
                        key={item.id}
                        value={item}
                        className={cn(
                          "group flex cursor-pointer select-none items-center px-1 py-3 pointer-events-auto",
                          (isSelected && highlightSelection) ? "bg-primary/90 text-white hover:bg-primary/90 hover:text-white" : "",
                          itemClassName
                        )}
                      >
                        {renderOption ? (
                          renderOption(item, isSelected)
                        ) : (
                          <div className="ml-3">
                            <div className="text-md">
                              {item.name}
                            </div>
                          </div>
                        )}
                      </ComboboxOption>
                    );
                  })
                ) : searchQuery ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No results found
                  </div>
                ) : null}
              </ComboboxOptions>
            </div>
          )}
        </div>
      </Combobox>
     
    </div>
  );
};

export default DropdownCustom;
export type { DropdownItem, DropdownCustomProps };