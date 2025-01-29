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
import { useEffect, useRef } from "react";

export interface MinimalTiptapProps
  extends Omit<UseMinimalTiptapEditorProps, "onUpdate"> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
  readOnly?: boolean;
}

const Toolbar = ({
  editor,
  disabled = false,
  readOnly = false,
}: {
  editor: Editor;
  disabled: boolean;
  readOnly: boolean;
}) => {
  return (
    <div className="shrink-0 overflow-x-auto border-b border-border bg-background p-2">
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
      </div>
    </div>
  );
};

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
      ...props
    },
    ref,
  ) => {
    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      extensions: [
        StarterKit,
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
      ],
      ...props,
    });
    //!!TO BE RECHECKED

    // useEffect(() => {
    //   if (editor) {
    //     editor.setEditable(!readOnly);
    //   }
    // }, [readOnly, editor]);

    if (!editor) {
      return null;
    }

    return (
      <MeasuredContainer
        as="div"
        name="editor"
        ref={ref}
        className={cn(
          "flex h-auto min-h-72 w-full flex-col rounded-md border border-input shadow-sm focus-within:border-primary",
          className,
        )}
      >
        <Toolbar editor={editor} disabled={editable} readOnly={readOnly} />
        <EditorContent
          editor={editor}
          readOnly={readOnly}
          className={cn("minimal-tiptap-editor", editorContentClassName)}
        />
        <LinkBubbleMenu editor={editor} />
      </MeasuredContainer>
    );
  },
);

MinimalTiptapEditor.displayName = "MinimalTiptapEditor";

export default MinimalTiptapEditor;
