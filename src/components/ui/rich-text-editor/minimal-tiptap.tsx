import * as React from "react";
import "./styles/index.css";

import type { Content, Editor } from "@tiptap/react";
import type { UseMinimalTiptapEditorProps } from "./hooks/use-minimal-tiptap";
import { EditorContent } from "@tiptap/react";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { SectionOne } from "./components/section/one";
import { LinkBubbleMenu } from "./components/bubble-menu/link-bubble-menu";
import { FontSize, useMinimalTiptapEditor } from "./hooks/use-minimal-tiptap";
import { MeasuredContainer } from "./components/measured-container";
import FontSizeControl from "./components/section/zero";
import SectionThree from "./components/section/three";
import SectionFour from "./components/section/four";
import SectionFive from "./components/section/five";
import SectionSix from "./components/section/six";
import SectionTwo from "./components/section/two";
import SectionSeven from "./components/section/seven";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Link } from "./extensions/link/link";
import ExtendedTextStyle from "./components/extended-text-style";
import { Image } from "./extensions/image/image";
import { CodeBlockLowlight, FileHandler } from "./extensions";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { useEffect } from "react";
import { Extension } from "@tiptap/core";
import CustomDropdownsSection from './components/section/custom-dropdowns-section';

// Create a custom extension to prevent new lines
const PreventNewlines = Extension.create({
  name: 'preventNewlines',
  addKeyboardShortcuts() {
    return {
      'Enter': () => true, // Prevent Enter key from creating new lines
    }
  },
});

// Update the MinimalTiptapProps interface to include the new configuration options
export interface MinimalTiptapProps
  extends Omit<UseMinimalTiptapEditorProps, "onUpdate"> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
  readOnly?: boolean;
  plainTextMode?: boolean;
  plainTextConfig?: {
    multiline?: boolean;
    maxHeight?: string;
  };
  disabled?: boolean;
  customDropdowns?: Array<{
    id: string;
    buttonLabel: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    options: Array<{
      label: string;
      value: string;
    }>;
    formatInsertedValue?: (option: { label: string; value: string }) => string;
    onSelect?: (option: { label: string; value: string }) => void;
    isFilterMode?:boolean
  }>;
}

// Update the Toolbar component to pass the new configuration options
const Toolbar = ({
  editor,
  disabled = false,
  readOnly = false,
  plainTextMode = false,
  customDropdowns
}: {
  editor: Editor;
  disabled: boolean;
  readOnly: boolean;
  plainTextMode?: boolean;
  customDropdowns?: MinimalTiptapProps['customDropdowns'];
}) => {

  if (plainTextMode) {
    return (
      <div className="shrink-0 overflow-x-auto border-b border-border bg-background px-2 py-1">
        <div className="flex w-max items-center gap-px">
          {/* Add custom dropdowns section */}
          {customDropdowns && customDropdowns.length > 0 && (
            <CustomDropdownsSection
              editor={editor}
              customDropdowns={customDropdowns}
              size="sm"
              variant="outline"
              disabled={disabled}
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
              size="sm"
              variant="outline"
              disabled={disabled}
            />
          </>
        )}
      </div>
    </div>
  );
};


// Keep only one MinimalTiptapEditor implementation - the forwardRef version
export const MinimalTiptapEditor = React.forwardRef<
  HTMLDivElement,
  MinimalTiptapProps
>(
  (
    {
      value,
      onChange,
      className,
      readOnly = false,
      editorContentClassName,
      editable = false,
      disabled = false, // Add this prop explicitly
      plainTextMode = false,
      plainTextConfig = {
        multiline: false,
        maxHeight: undefined  // This is already correct, but let's ensure it's used properly
      },
      customDropdowns,
      output = "html",
      placeholder = "",
      onBlur,
      ...props
    },
    ref,
  ) => {
    // Configure extensions based on mode
    const extensions = [
      // Always include StarterKit for basic functionality
      StarterKit.configure({
        // Disable certain features in plain text mode
        heading: plainTextMode ? false : undefined,
        bulletList: plainTextMode ? false : undefined,
        orderedList: plainTextMode ? false : undefined,
        blockquote: plainTextMode ? false : undefined,
        codeBlock: plainTextMode ? false : undefined,
        horizontalRule: plainTextMode ? false : undefined,
      }),
      // Only include formatting extensions in rich text mode
      ...(!plainTextMode ? [
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Underline,
        ExtendedTextStyle,
        FontSize,
        Image,
        Link,
        FileHandler,
        CodeBlockLowlight,
        HorizontalRule,
      ] : []),
      // Add the PreventNewlines extension in plain text mode when multiline is false
      ...(plainTextMode && !plainTextConfig?.multiline ? [PreventNewlines] : []),
    ];


    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      extensions,
      placeholder,
      output,
      onBlur,
      ...props,
    });

    // Rest of the component remains unchanged
    // Apply plain text mode styling and behavior
    useEffect(() => {
      if (editor && plainTextMode) {
        // Add a class to the editor for plain text styling
        const editorElement = document.querySelector('.ProseMirror');
        if (editorElement) {
          editorElement.classList.add('plain-text-mode');
        }

        // Force all content to be in a single paragraph
        const handlePaste = (event: ClipboardEvent) => {
          if (plainTextMode) {
            event.preventDefault();
            const text = event.clipboardData?.getData('text/plain') || '';
            // Insert as plain text without line breaks
            editor.commands.insertContent(text.replace(/[\r\n]+/g, ' '));
          }
        };

        // Add paste event listener
        editorElement?.addEventListener('paste', handlePaste as EventListener);

        return () => {
          editorElement?.removeEventListener('paste', handlePaste as EventListener);
        };
      }
    }, [editor, plainTextMode]);

    if (!editor) {
      return null;
    }

    return (
      <MeasuredContainer
        as="div"
        name="editor"
        ref={ref}
        className={cn(
          "flex h-auto w-full flex-col rounded-md border border-input shadow-sm",
          plainTextMode ? "min-h-12" : "min-h-72",
          plainTextMode && "plain-text-editor",
          plainTextMode && plainTextConfig?.multiline && "multiline",
          disabled && "opacity-100 cursor-not-allowed",
          className,
        )}
        style={{
          // Only add the CSS variable if maxHeight is defined
          ...(plainTextConfig?.maxHeight ? {
            '--plain-text-max-height': plainTextConfig.maxHeight
          } : {}) as React.CSSProperties
        }}
      >
        {((!plainTextMode) || (plainTextMode && customDropdowns && customDropdowns.length > 0)) && (
          <Toolbar
            editor={editor}
            disabled={disabled || readOnly}
            readOnly={readOnly}
            plainTextMode={plainTextMode}
            customDropdowns={customDropdowns}
          />
        )}
        <EditorContent
          editor={editor}
          readOnly={readOnly}
          className={cn(
            "minimal-tiptap-editor",
            "flex-1 overflow-auto",
            plainTextMode ? "py-2" : "py-4",
            editorContentClassName,
          )}
        />
        <LinkBubbleMenu editor={editor} />
      </MeasuredContainer>
    );
  },
);

MinimalTiptapEditor.displayName = "MinimalTiptapEditor";
