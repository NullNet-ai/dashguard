import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { VariantProps } from "class-variance-authority";
import type { toggleVariants } from "~/components/ui/toggle";
import { EntityVariableSelector, type EntityVariableOption } from "../entity-variable/entity-variable-selector";

interface EntityVariableSectionProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  entityOptions?: EntityVariableOption[];
  variableOptions?: EntityVariableOption[];
  disabled?: boolean;
  // Configuration options
  entityButtonLabel?: string;
  entitySearchPlaceholder?: string;
  entityEmptyMessage?: string;
  variableButtonLabel?: string;
  variableSearchPlaceholder?: string;
  variableEmptyMessage?: string;
  insertInEditor?: boolean;
  entityFormatInsertedValue?: (option: EntityVariableOption) => string;
  variableFormatInsertedValue?: (option: EntityVariableOption) => string;
  onEntitySelect?: (option: EntityVariableOption) => void;
  onVariableSelect?: (option: EntityVariableOption) => void;
  showEntitySelector?: boolean;
  showVariableSelector?: boolean;
}

export const EntityVariableSection: React.FC<EntityVariableSectionProps> = ({
  editor,
  entityOptions = [],
  variableOptions = [],
  size,
  variant,
  disabled,
  // Configuration options with defaults
  entityButtonLabel,
  entitySearchPlaceholder,
  entityEmptyMessage,
  variableButtonLabel,
  variableSearchPlaceholder,
  variableEmptyMessage,
  insertInEditor = true,
  entityFormatInsertedValue,
  variableFormatInsertedValue,
  onEntitySelect,
  onVariableSelect,
  showEntitySelector = true,
  showVariableSelector = true,
}) => {
  // Combine options for display
  const allOptions = React.useMemo(() => {
    return [...entityOptions, ...variableOptions];
  }, [entityOptions, variableOptions]);

  return (
    <section className='flex gap-2'>
      {showEntitySelector && entityOptions.length > 0 && (
        <EntityVariableSelector
          editor={editor}
          options={allOptions}
          type="entity"
          buttonLabel={entityButtonLabel}
          searchPlaceholder={entitySearchPlaceholder}
          emptyMessage={entityEmptyMessage}
          size={size}
          variant={variant}
          disabled={disabled}
          insertInEditor={insertInEditor}
          formatInsertedValue={entityFormatInsertedValue}
          onSelect={onEntitySelect}
          
        />
      )}
      {showVariableSelector && variableOptions.length > 0 && (
        <EntityVariableSelector
          editor={editor}
          options={allOptions}
          type="variable"
          buttonLabel={variableButtonLabel}
          searchPlaceholder={variableSearchPlaceholder}
          emptyMessage={variableEmptyMessage}
          size={size}
          variant={variant}
          disabled={disabled}
          insertInEditor={insertInEditor}
          formatInsertedValue={variableFormatInsertedValue}
          onSelect={onVariableSelect}
        />
      )}
    </section>
  );
};

export default EntityVariableSection;