"use client";

import * as React from "react";
import { Button, type ButtonProps } from "~/components/ui/button";
import {
  ArrowPathIcon as Loader2,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { testIDFormatter } from "~/utils/formatter";
import { PlusIcon } from "lucide-react";

interface DropdownOption {
  label: string;
  onClick: () => void; // Function to be called on click
  loading?: boolean; // Optional loading state for the option
  disabled?: boolean; // Optional disabled state
}

interface ButtonWithDropdownProps {
  buttonLabel?: string; // Dynamic button label
  buttonIcon?: React.ElementType; // Optional icon component
  dropdownOptions: DropdownOption[]; // List of dropdown options
  loading?: boolean; // Loading state for the main button
  buttonClassName?: string; // Custom className for the button
  buttonVariant?: ButtonProps["variant"]; // Optional button variant (from Button component)
  disabled?: boolean; // Optional disabled state for the main button
  entity?: string; // Optional entity name for test IDs
  leftIcon?: React.ElementType; // Optional left icon component
  side?: 'start' | 'end'; // Optional side for the dropdown
}

export function ButtonWithDropdown({
  buttonLabel,
  buttonIcon: ButtonIcon,
  dropdownOptions,
  loading = false, // Main button loading state
  buttonClassName,
  buttonVariant = "outline", // Default to 'outline' variant
  disabled = false,
  entity,
  leftIcon: Lefticon,
  side = 'end',
}: ButtonWithDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-test-id={testIDFormatter(`${entity}-wzrd-drd-trigger-btn`)}
          variant={buttonVariant} // Use the provided button variant
          className={cn("flex items-center", buttonClassName)} // Allow custom className
          disabled={disabled}
          size={'sm'}
        >
          {Lefticon && <Lefticon className="mr-2 h-4 w-4" />}
          {/* Render left icon if provided */}
          {buttonLabel || ""}
          {ButtonIcon && <ButtonIcon className="mr-2 h-5 w-5" />}{" "}
          {/* Render icon if provided */}
          {loading && <Loader2 className={cn("h-4 w-4 animate-spin")} />}
          {/* Display loading spinner if in loading state */}
          <ChevronDownIcon
            className={`${buttonLabel ? "ml-2" : ""} h-3 w-4 text-primary-freground`}
            aria-hidden="true"
            strokeWidth={3}
          />
          {/* Arrow icon for dropdown */}
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu content with responsive handling */}
      <DropdownMenuContent
        align={side} // Align to the end (right), but Radix UI handles edge cases
        className="w-56 max-w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none"
        sideOffset={5} // Offset for the dropdown from the trigger button
        side="bottom" // Default side where the dropdown will open
        collisionPadding={10} // Avoid the content colliding with the edge of the screen
      >
        {dropdownOptions.map((option, index) => (
          <DropdownMenuItem
            data-test-id={testIDFormatter(`${entity}-wzrd-drd-opt-${option?.label?.replace(/\s/g, "")}`)}
            key={index}
            onClick={() => {
              if (disabled) return; // Ignore disabled or loading options
              option.onClick(); // Call the onClick function
            }}
            className={`block w-full px-4 py-2 text-left text-sm ${
              disabled
                ? "cursor-not-allowed text-gray-500"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            disabled={disabled} // Disable button if specified
          >
            {option.loading ? "Loading..." : option.label}
            {/* Display loading text for the option */}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
