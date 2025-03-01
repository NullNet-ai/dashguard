'use client'
import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";
import { Input } from "./input";
import { cn } from "~/lib/utils";
import { useFormField } from './form';

interface ValueProps {
  selectValue: string;
  inputValue: string;
}

export interface ComboBoxProps {
  selectOptions: { value: string; label: string }[];
  onValueParsed?: (values: ValueProps) => void;
  inputPlaceholder?: string;
  selectPlaceholder?: string;
  className?: string;
  selectValue?: string;
  inputValue?: string;
  onSelectChange?: (value: string) => void;
  onInputChange?: (value: string) => void;
  onCombinedChange?: (combinedValue: string) => void;
  disabled?: boolean;
  readonly?:boolean;
}

const ComboBox = React.forwardRef<HTMLDivElement, ComboBoxProps>(
  ({
    selectOptions,
    inputPlaceholder,
    selectPlaceholder,
    className,
    selectValue: propSelectValue = '',
    inputValue: propInputValue = '',
    onSelectChange,
    onInputChange,
    onCombinedChange,
    disabled,
    readonly
  }, ref) => {
    // Initialize internal state with provided props
    const [internalSelect, setInternalSelect] = React.useState(propSelectValue);
    const [internalInput, setInternalInput] = React.useState(propInputValue);

    // Update internal state when props change
    React.useEffect(() => {
      setInternalSelect(propSelectValue);
      setInternalInput(propInputValue);
    }, [propSelectValue, propInputValue]);

    const isControlled = propSelectValue !== undefined && propInputValue !== undefined;
    const selectValue = isControlled ? propSelectValue : internalSelect;
    const inputValue = isControlled ? propInputValue : internalInput;

    const updateValues = (newSelect: string, newInput: string) => {
      if (!isControlled) {
        setInternalSelect(newSelect);
        setInternalInput(newInput);
      }
      onCombinedChange?.(`${newSelect}${newInput}`);
    };

    const handleSelectChange = (value: string) => {
      onSelectChange?.(value);
      updateValues(value, inputValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onInputChange?.(value);
      updateValues(selectValue, value);
    };
    
    const {error:hasError} = useFormField();


    return (
      <div
        ref={ref}
      className={cn(
          "flex items-center rounded-md border border-input focus-within:ring-1 focus-within:ring-ring focus-within:border-primary group",
          disabled && "bg-secondary border-gray-300",
          hasError && "border-red-500",
          className
        )}
      >
        <Select value={selectValue} onValueChange={handleSelectChange} disabled={disabled || readonly}  >
          <SelectTrigger
            className={cn("h-[36px] w-[120px] border-0 bg-secondary rounded-r-none focus:ring-primary group-focus-visible:border-r-primary focus:ring-0 shadow-none rounded-l-md border-r border-r-input disabled:cursor-auto  focus-visible:ring-1",disabled && "border-r-0 text-muted-foreground disabled:cursor-not-allowed" )}
            
          >
            <SelectValue placeholder={selectPlaceholder} className='' />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={inputPlaceholder}
          className="border-0 rounded-l-none focus-visible:ring-0 shadow-none rounded-r-md"
          readOnly={readonly}
        />
      </div>
    );
  }
);

ComboBox.displayName = "ComboBox";

export { ComboBox };