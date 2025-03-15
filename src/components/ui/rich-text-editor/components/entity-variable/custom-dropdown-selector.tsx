import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Check, ChevronDown, } from "lucide-react";
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

export interface CustomDropdownConfig {
  id: string;
  buttonLabel: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  isFilterMode?: boolean;
  options: Array<{
    label: string;
    value: string;
  }>;
  formatInsertedValue?: (option: { label: string; value: string }) => string;
  onSelect?: (option: { label: string; value: string }) => void;
}

interface CustomDropdownSelectorProps extends CustomDropdownConfig {
  editor: Editor;
  disabled?: boolean;
  size?: VariantProps<typeof toggleVariants>["size"];
  variant?: VariantProps<typeof toggleVariants>["variant"];
}

export const CustomDropdownSelector: React.FC<CustomDropdownSelectorProps> = ({
  editor,
  buttonLabel,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  options = [],
  formatInsertedValue = (option) => `{{${option.value}}}`,
  onSelect,
  disabled = false,
  isFilterMode = false,
  size = "default",
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);

  // Update button label if in filter mode and an option is selected
  const displayLabel = React.useMemo(() => {
    if (isFilterMode && selectedOption) {
      const option = options.find((opt) => opt.value === selectedOption);
      return option ? option.label : buttonLabel;
    }
    return buttonLabel;
  }, [isFilterMode, selectedOption, options, buttonLabel]);

  const handleSelect = React.useCallback(
    (option: { label: string; value: string }) => {
      // If in filter mode, just update the selected option
      if (isFilterMode) {
        setSelectedOption(option.value);
      } else {
        // Otherwise, insert the value into the editor
        const insertValue = formatInsertedValue(option);
        if (insertValue && editor.isEditable) {
          editor.commands.insertContent(insertValue);
        }
      }

      // Call the onSelect callback if provided
      if (onSelect) {
        onSelect(option);
      }

      // Close the dropdown
      setOpen(false);
    },
    [editor, formatInsertedValue, isFilterMode, onSelect]
  );

  // Force the dropdown to close when disabled
  React.useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [disabled, open]);

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-auto justify-between",
            disabled && "cursor-not-allowed disabled:opacity-100"
          )}
          disabled={disabled}
          size={size === "sm" ? "sm" : "default"}
        >
          {displayLabel}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px]  p-0" align="start">
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