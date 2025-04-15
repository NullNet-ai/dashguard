/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { type VariantProps } from "class-variance-authority";
import { type toggleVariants } from "~/components/ui/toggle";
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

export interface EntityVariableOption {
  label: string;
  value: string;
}

interface EntityVariableSelectorProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  options: EntityVariableOption[];
  buttonLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  formatInsertedValue?: (option: EntityVariableOption) => string;
  insertInEditor?: boolean;
  disabled?: boolean;
  onSelect?: (option: EntityVariableOption) => void;
  type?: "entity" | "variable";
  isFilterMode?: boolean;
  show?: boolean; // Add this property to control visibility
}

export const EntityVariableSelector: FC<EntityVariableSelectorProps> = ({
  editor,
  options = [],
  buttonLabel = "Insert Variable",
  searchPlaceholder = "Search variables...",
  emptyMessage = "No variables found.",
  formatInsertedValue = (option) => `{{${option.value}}}`,
  insertInEditor = true,
  disabled = false,
  size = "default",
  onSelect,
  type = "variable",
  isFilterMode = false,
  show = true, // Default to showing the component
}) => {
  // If show is false, don't render anything
  if (show === false) {
    return null;
  }
  
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<EntityVariableOption | null>(null);

  // Force the dropdown to close when disabled
  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [disabled, open]);

  // Determine the display label based on selection and type
  const displayLabel = useMemo(() => {
    if ((type === "entity" || isFilterMode) && selectedOption) {
      return selectedOption.label;
    }
    return buttonLabel;
  }, [buttonLabel, selectedOption, type, isFilterMode]);

  const handleSelect = useCallback(
    (option: EntityVariableOption) => {
      // Update selected option
      setSelectedOption(option);
      
      // Insert the value into the editor if insertInEditor is true and not in filter mode
      if (insertInEditor && editor.isEditable && !(type === "entity" || isFilterMode)) {
        const insertValue = formatInsertedValue(option);
        editor.commands.insertContent(insertValue);
      }

      // Call the onSelect callback if provided
      if (onSelect) {
        onSelect(option);
      }

      // Close the dropdown
      setOpen(false);
    },
    [editor, formatInsertedValue, insertInEditor, onSelect, type, isFilterMode]
  );

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-auto justify-between",
            disabled && "cursor-not-allowed opacity-100"
          )}
          disabled={disabled}
          size={size === "sm" ? "sm" : "default"}
        >
          {displayLabel}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className='border-0  px-0 focus:border-0 flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0' />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option)}
                >
                  <Check 
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedOption?.value === option.value ? "opacity-100" : "opacity-0"
                    )} 
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};