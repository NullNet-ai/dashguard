// Make sure the component accepts and uses size and variant props
import * as React from "react";
import type { Editor } from "@tiptap/react";
import { type VariantProps } from "class-variance-authority";
import { type toggleVariants } from "~/components/ui/toggle";
import { CustomDropdownSelector } from "../entity-variable/custom-dropdown-selector";
import { type CustomDropdownConfig } from "../entity-variable/custom-dropdown-selector";

interface CustomDropdownsSectionProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  customDropdowns: CustomDropdownConfig[];
  disabled?: boolean;
}

const CustomDropdownsSection: React.FC<CustomDropdownsSectionProps> = ({
  editor,
  customDropdowns,
  size,
  variant,
  disabled,
}) => {
  return (
    <div className="flex items-center gap-1">
      {customDropdowns.map((dropdown) => (
        <CustomDropdownSelector
          id='custom-dropdown'
          key={dropdown.id}
          editor={editor}
          buttonLabel={dropdown.buttonLabel}
          searchPlaceholder={dropdown.searchPlaceholder}
          emptyMessage={dropdown.emptyMessage}
          options={dropdown.options}
          formatInsertedValue={dropdown.formatInsertedValue}
          onSelect={dropdown.onSelect}
          isFilterMode={dropdown.isFilterMode}
          size={size}
          variant={variant}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default CustomDropdownsSection;