import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { FormatAction } from "../../types";
import type { toggleVariants } from "~/components/ui/toggle";
import type { VariantProps } from "class-variance-authority";
import { RemoveFormattingIcon as TextNoneIcon } from "lucide-react";
import {
  CommandLineIcon as CodeIcon,
  EllipsisHorizontalIcon as DotsHorizontalIcon,
  BoldIcon as FontBoldIcon,
  ItalicIcon as FontItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "@heroicons/react/20/solid";
import { ToolbarSection } from "../toolbar-section";

type TextStyleAction =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "clearFormatting";

interface TextStyle extends FormatAction {
  value: TextStyleAction;
}

const formatActions: TextStyle[] = [
  {
    value: "bold",
    label: "Bold",
    icon: (
      <FontBoldIcon className="size-5 disabled:cursor-auto disabled:border-muted disabled:bg-background disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent" />
    ),
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBold().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "B"],
  },
  {
    value: "italic",
    label: "Italic",
    icon: (
      <FontItalicIcon className="size-5 disabled:cursor-auto disabled:border-muted disabled:bg-background disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent" />
    ),
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleItalic().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "I"],
  },
  {
    value: "underline",
    label: "Underline",
    icon: (
      <UnderlineIcon className="size-5 disabled:cursor-auto disabled:border-muted disabled:bg-background disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent" />
    ),
    action: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive("underline"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleUnderline().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "U"],
  },
  {
    value: "strikethrough",
    label: "Strikethrough",
    icon: (
      <StrikethroughIcon className="size-5 disabled:cursor-auto disabled:border-muted disabled:bg-background disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent" />
    ),
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleStrike().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "shift", "S"],
  },
  {
    value: "code",
    label: "Code",
    icon: (
      <CodeIcon className="size-5 disabled:cursor-auto disabled:border-muted disabled:bg-background disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent" />
    ),
    action: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive("code"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleCode().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "E"],
  },
  {
    value: "clearFormatting",
    label: "Clear formatting",
    icon: (
      <TextNoneIcon className="size-5 disabled:cursor-auto disabled:border-muted disabled:bg-background disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent" />
    ),
    action: (editor) => editor.chain().focus().unsetAllMarks().run(),
    isActive: () => false,
    canExecute: (editor) =>
      editor.can().chain().focus().unsetAllMarks().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "\\"],
  },
];

interface SectionThreeProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: TextStyleAction[];
  mainActionCount?: number;
  disabled?: boolean;
}

export const SectionThree: React.FC<SectionThreeProps> = ({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 2,
  size,
  variant,
  disabled,
}) => {
  return (
    <ToolbarSection
      editor={editor}
      actions={formatActions}
      activeActions={activeActions}
      mainActionCount={mainActionCount}
      dropdownIcon={
        <DotsHorizontalIcon className="size-5 disabled:cursor-auto disabled:border-muted disabled:bg-background disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent" />
      }
      dropdownTooltip="More formatting"
      dropdownClassName="w-8 disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted disabled:bg-background"
      size={size}
      variant={variant}
      disabled={disabled}
    />
  );
};

SectionThree.displayName = "SectionThree";

export default SectionThree;
