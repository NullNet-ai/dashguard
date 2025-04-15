import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Separator } from "~/components/ui/separator";
import FontSizeControl from "./section/zero";
import SectionOne from "./section/one";
import SectionTwo from "./section/two";
import SectionThree from "./section/three";
import SectionFour from "./section/four";
import SectionFive from "./section/five";
import SectionSix from "./section/six";
import SectionSeven from "./section/seven";
import EntityVariableSection from "./section/entity-variable-section";
import CustomDropdownsSection from "./section/custom-dropdowns-section";
import { type EntityVariableOption } from "./entity-variable/entity-variable-selector";
import { type CustomDropdownConfig } from "./entity-variable/custom-dropdown-selector";

interface ToolbarProps {
  editor: Editor;
  disabled?: boolean;
  readOnly?: boolean;
  entityOptions?: EntityVariableOption[];
  variableOptions?: EntityVariableOption[];
  plainTextMode?: boolean;
  entitySelectorConfig?: {
    buttonLabel?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    formatInsertedValue?: (option: EntityVariableOption) => string;
    insertInEditor?: boolean;
    show?: boolean;
  };
  variableSelectorConfig?: {
    buttonLabel?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    formatInsertedValue?: (option: EntityVariableOption) => string;
    insertInEditor?: boolean;
    show?: boolean;
  };
  customDropdowns?: CustomDropdownConfig[];
  onEntitySelect?: (option: EntityVariableOption) => void;
  onVariableSelect?: (option: EntityVariableOption) => void;
}

export const Toolbar = ({
  editor,
  disabled = false,
  readOnly = false,
  entityOptions = [],
  variableOptions = [],
  plainTextMode = false,
  entitySelectorConfig,
  variableSelectorConfig,
  customDropdowns = [],
  onEntitySelect,
  onVariableSelect,
}: ToolbarProps) => {
  if (!editor) {
    return null;
  }

  // Simplified toolbar for plain text mode
  // Simplified toolbar for plain text mode
  if (plainTextMode) {
    return (
      <div className="shrink-0 overflow-x-auto border-b border-border bg-background px-2">
        <div className="flex w-max items-center gap-px">
          {/* Add custom dropdowns section */}
          {customDropdowns && customDropdowns.length > 0 && (
            <CustomDropdownsSection
              editor={editor}
              customDropdowns={customDropdowns}
              size="sm"  // Add size prop
              variant="outline"  // Add variant prop
              disabled={disabled}
            />
          )}

          {/* Add separator if we have both custom dropdowns and entity/variable selectors */}
          {customDropdowns && customDropdowns.length > 0 && 
           ((entityOptions?.length && entitySelectorConfig?.show !== false) || 
            (variableOptions?.length && variableSelectorConfig?.show !== false)) && (
            <Separator orientation="vertical" className="mx-2 h-7" />
          )}

          {/* Entity/Variable section */}
          {((entityOptions?.length && entitySelectorConfig?.show !== false) || 
            (variableOptions?.length && variableSelectorConfig?.show !== false)) && (
            <EntityVariableSection
              editor={editor}
              size="sm"
              variant="outline"
              disabled={disabled}
              entityOptions={entityOptions}
              variableOptions={variableOptions}
              // Pass configuration options
              entityButtonLabel={entitySelectorConfig?.buttonLabel}
              entitySearchPlaceholder={entitySelectorConfig?.searchPlaceholder}
              entityEmptyMessage={entitySelectorConfig?.emptyMessage}
              entityFormatInsertedValue={entitySelectorConfig?.formatInsertedValue}
              insertInEditor={entitySelectorConfig?.insertInEditor ?? variableSelectorConfig?.insertInEditor ?? true}
              variableButtonLabel={variableSelectorConfig?.buttonLabel}
              variableSearchPlaceholder={variableSelectorConfig?.searchPlaceholder}
              variableEmptyMessage={variableSelectorConfig?.emptyMessage}
              variableFormatInsertedValue={variableSelectorConfig?.formatInsertedValue}
              onEntitySelect={onEntitySelect}
              onVariableSelect={onVariableSelect}
              showEntitySelector={entitySelectorConfig?.show !== false}
              showVariableSelector={variableSelectorConfig?.show !== false}
            />
          )}
        </div>
      </div>
    );
  }

  // Regular toolbar for rich text mode
  return (
    <div className="shrink-0 overflow-x-auto border-b border-border bg-background px-2">
      <div className="flex w-max items-center gap-px">
        <FontSizeControl
          className="disabled:cursor-auto disabled:opacity-100 hover:disabled:bg-transparent"
          editor={editor}
          defaultSize={16}
          min={8}
          max={96}
          size="sm"
          variant="outline"
          disabled={disabled}
        />
        <Separator orientation="vertical" className="mx-2 h-7" />
        <SectionOne
          editor={editor}
          activeLevels={[1, 2, 3, 4, 5, 6]}
          disabled={disabled}
        />
        <Separator orientation="vertical" className="mx-2 h-7" />
        <SectionTwo editor={editor} disabled={disabled} />
        <Separator orientation="vertical" className="mx-2 h-7" />
        <SectionThree
          editor={editor}
          activeActions={[
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "code",
            "clearFormatting",
          ]}
          mainActionCount={disabled ? 0 : 3}
          disabled={disabled}
        />
        <Separator orientation="vertical" className="mx-2 h-7" />
        <SectionFour editor={editor} disabled={disabled} />
        <Separator orientation="vertical" className="mx-2 h-7" />
        <SectionFive
          editor={editor}
          activeActions={["orderedList", "bulletList"]}
          mainActionCount={0}
          disabled={disabled}
        />
        <Separator orientation="vertical" className="mx-2 h-7" />
        <SectionSix
          editor={editor}
          activeActions={[
            "centerAlign",
            "rightAlign",
            "justifyAlign",
            "leftAlign",
          ]}
          mainActionCount={0}
          disabled={disabled}
        />
        <Separator orientation="vertical" className="mx-2 h-7" />
        <SectionSeven
          editor={editor}
          activeActions={["codeBlock", "blockquote", "horizontalRule"]}
          mainActionCount={0}
          disabled={disabled}
        />
        
        {/* Add custom dropdowns section to rich text mode */}
        {customDropdowns && customDropdowns.length > 0 && (
          <>
            <Separator orientation="vertical" className="mx-2 h-7" />
            <CustomDropdownsSection
              editor={editor}
              customDropdowns={customDropdowns}
              size="sm"  // Add size prop
              variant="outline"  // Add variant prop
              disabled={disabled || readOnly}
            />
          </>
        )}
        
        {/* Add Entity/Variable Section */}
        {((entityOptions?.length && entitySelectorConfig?.show !== false) || 
          (variableOptions?.length && variableSelectorConfig?.show !== false)) && (
        <>
          <Separator orientation="vertical" className="mx-2 h-7" />
          <EntityVariableSection
            editor={editor}
            size="sm"
            variant="outline"
            disabled={disabled}
            entityOptions={entityOptions}
            variableOptions={variableOptions}
            // Pass configuration options
            entityButtonLabel={entitySelectorConfig?.buttonLabel}
            entitySearchPlaceholder={entitySelectorConfig?.searchPlaceholder}
            entityEmptyMessage={entitySelectorConfig?.emptyMessage}
            entityFormatInsertedValue={entitySelectorConfig?.formatInsertedValue}
            insertInEditor={entitySelectorConfig?.insertInEditor ?? variableSelectorConfig?.insertInEditor ?? true}
            variableButtonLabel={variableSelectorConfig?.buttonLabel}
            variableSearchPlaceholder={variableSelectorConfig?.searchPlaceholder}
            variableEmptyMessage={variableSelectorConfig?.emptyMessage}
            variableFormatInsertedValue={variableSelectorConfig?.formatInsertedValue}
            onEntitySelect={onEntitySelect}
            onVariableSelect={onVariableSelect}
            showEntitySelector={entitySelectorConfig?.show !== false}
            showVariableSelector={variableSelectorConfig?.show !== false}
          />
        </>
        )}
      </div>
    </div>
  );
};