import * as React from "react";
import { cn } from "~/lib/utils";
import { Button, type ButtonProps, type ButtonIconProps } from "./button";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Switch, type SwitchProps } from "./switch";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  borderRadius?: ButtonProps["borderRadius"];
  children: React.ReactNode;
}

// Basic button item for the group
interface ButtonGroupItemProps extends ButtonProps, ButtonIconProps {
  active?: boolean;
}

// Checkbox button item
interface CheckboxItemProps extends ButtonProps {
  isChecked?: boolean;
  onCheckChange?: (checked: boolean) => void;
}

// Dropdown button item
interface DropdownItemProps extends ButtonProps {
  dropdownOptions: Array<{ label: string; onClick: () => void }>;
}

// Custom item that can accept any React node
interface CustomItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  asButton?: boolean;
  readonly?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, variant = "secondary", size = "default", borderRadius = "soft-edged", children, ...props }, ref) => {
    // Clone children to pass down variant, size, and borderRadius props
    const childrenWithProps = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          variant,
          size,
          borderRadius,
          className: cn(
            "rounded-none border-r border-border",
            child.props.className
          ),
          ...child.props,
        });
      }
      return child;
    });

    return (
      <div
        ref={ref}
        className={cn("inline-flex", className)}
        {...props}
      >
        {childrenWithProps}
      </div>
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

// Basic button item
const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, active, variant, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={active ? "default" : variant}
        className={cn(
          className
        )}
        {...props}
      />
    );
  }
);
ButtonGroupItem.displayName = "ButtonGroupItem";

// Checkbox button item
const CheckboxItem = React.forwardRef<HTMLButtonElement, CheckboxItemProps>(
  ({ className, isChecked = false, onCheckChange, children, onClick, ...props }, ref) => {
    const [checked, setChecked] = React.useState(isChecked);
    
    // Update checked state when isChecked prop changes
    React.useEffect(() => {
      setChecked(isChecked);
    }, [isChecked]);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const newChecked = !checked;
      setChecked(newChecked);
      if (onCheckChange) {
        onCheckChange(newChecked);
      }
      if (onClick) {
        onClick(e);
      }
    };
    
    return (
      <Button
        ref={ref}
        className={cn(className)}
        onClick={handleClick}
        variant={'secondary'}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Checkbox checked={checked}  className="pointer-events-none" />
          {children}
        </div>
      </Button>
    );
  }
);
CheckboxItem.displayName = "CheckboxItem";




// Dropdown button item
const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, dropdownOptions, children, ...props }, ref) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    
    return (
      <div className="relative">
        <Button
          ref={ref}
          className={cn(className)}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          {...props}
        >
          <div className="flex items-center gap-2">
            {children}
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </Button>
        
        {dropdownOpen && (
          <div className="absolute left-0 top-full z-10 mt-1 w-full min-w-[180px] rounded-md border border-input bg-background p-1 shadow-md">
            {dropdownOptions.map((option, index) => (
              <button
                key={index}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  option.onClick();
                  setDropdownOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
DropdownItem.displayName = "DropdownItem";

// Custom item that can accept any React node
const CustomItem = React.forwardRef<HTMLDivElement, CustomItemProps>(
  ({ className, children, asButton = false, readonly = false, ...props }, ref) => {
    if (asButton) {
      return (
        <Button
          ref={ref as React.ForwardedRef<HTMLButtonElement>}
          className={cn(
            readonly && "pointer-events-none active:shadow-none",
            className
          )}
          disabled={readonly}
          {...props as any}
        >
          {children}
        </Button>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center px-2 h-full bg-secondary text-secondary-foreground border border-input",
          readonly && "pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CustomItem.displayName = "CustomItem";

// Radio button item
interface RadioItemProps extends ButtonProps {
  value: string;
}

// Radio group for button group
interface RadioGroupButtonProps extends React.ComponentPropsWithoutRef<typeof RadioGroup> {
  children: React.ReactNode;
}

// Radio button item
const RadioItem = React.forwardRef<HTMLButtonElement, RadioItemProps>(
  ({ className, value, children, ...props }, ref) => {
    // Create a unique ID for this radio item
    const id = React.useId();
    
    return (
      <Button
        ref={ref}
        type="button"
        variant={'secondary'}
        className={cn("rounded-none",className)}
        {...props}
      >
        <label htmlFor={id}>
          <div className="flex items-center gap-2">
            <RadioGroupItem 
              id={id}
              value={value} 
              className="pointer-events-none"
            />
            {children}
          </div>
        </label>
      </Button>
    );
  }
);
RadioItem.displayName = "RadioItem";

// Radio group for button group
const RadioGroupButton = React.forwardRef<
  React.ElementRef<typeof RadioGroup>,
  RadioGroupButtonProps
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroup
      ref={ref}
      className={cn("gap-0 flex", className)}
      {...props}
    >
      {children}
    </RadioGroup>
  );
});
RadioGroupButton.displayName = "RadioGroupButton";

// Make sure these are included in the export
// Switch item
interface SwitchItemProps extends Omit<ButtonProps, 'checked' | 'onCheckedChange' | 'size'>,
  Pick<SwitchProps, 'leftIcon' | 'rightIcon' | 'size'> {
  isChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  switchClassName?: string;
}

// Switch item
const SwitchItem = React.forwardRef<HTMLButtonElement, SwitchItemProps>(
  ({ 
    className, 
    children, 
    isChecked = false, 
    onCheckedChange,
    leftIcon,
    rightIcon,
    size,
    switchClassName,
    onClick,
    ...props 
  }, ref) => {
    const [checked, setChecked] = React.useState(isChecked);
    
    // Update checked state when isChecked prop changes
    React.useEffect(() => {
      setChecked(isChecked);
    }, [isChecked]);
    
    const handleCheckedChange = (newChecked: boolean) => {
      setChecked(newChecked);
      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
    };
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Toggle the switch when the button is clicked
      const newChecked = !checked;
      setChecked(newChecked);
      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
      
      // Call the original onClick if provided
      if (onClick) {
        onClick(e);
      }
    };
    
    return (
      <Button
        ref={ref}
        className={cn("flex justify-between", className)}
        onClick={handleClick}
        variant={"secondary"}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
        </div>
        <Switch 
          checked={checked}
          onCheckedChange={handleCheckedChange}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          size={size}
          className={cn("ml-2 pointer-events-none", switchClassName)}
        />
      </Button>
    );
  }
);
SwitchItem.displayName = "SwitchItem";




// Make sure these are included in the export
export { 
  ButtonGroup, 
  ButtonGroupItem, 
  CheckboxItem, 
  RadioItem,
  RadioGroupButton,
  SwitchItem,
  DropdownItem, 
  CustomItem 
};