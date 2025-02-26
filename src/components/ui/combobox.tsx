'use client'
import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";
import { Input } from "./input";
import { cn } from "~/lib/utils";

interface ComboBoxProps {
  selectOptions: { value: string; label: string }[];
  inputPlaceholder?: string;
  selectPlaceholder?: string;
  className?: string;
  onSelectChange?: (value: string) => void;
  onInputChange?: (value: string) => void;
}

const ComboBox = React.forwardRef<HTMLDivElement, ComboBoxProps>(
  ({ selectOptions, inputPlaceholder, selectPlaceholder, className, onSelectChange, onInputChange }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center rounded-md border border-input focus-within:ring-1 focus-within:ring-ring focus-within:border-primary",
          className
        )}
      >
        <Select onValueChange={onSelectChange} >
          <SelectTrigger
            className="h-[36px] w-[120px] border-0 bg-secondary rounded-r-none focus:ring-0 shadow-none rounded-l-md border-r"
          >
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent >
            {selectOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          onChange={(e) => onInputChange?.(e.target.value)}
          placeholder={inputPlaceholder}
          className="border-0 rounded-l-none focus-visible:ring-0 shadow-none rounded-r-md"
        />
      </div>
    );
  }
);

ComboBox.displayName = "ComboBox";

export { ComboBox };