import * as React from "react";
import { type Editor } from "@tiptap/react";
import type { FormatAction } from "../../types";
import type { toggleVariants } from "~/components/ui/toggle";
import type { VariantProps } from "class-variance-authority";
import {
  ChevronDownIcon as CaretDownIcon,
  Bars3Icon,
  Bars3BottomLeftIcon,
  Bars3CenterLeftIcon,
  Bars3BottomRightIcon,
} from "@heroicons/react/20/solid";
import { ToolbarSection } from "../toolbar-section";

type ListItemAction =
  | "leftAlign"
  | "centerAlign"
  | "rightAlign"
  | "justifyAlign";

interface ListItem extends FormatAction {
  value: ListItemAction;
}

const formatActions: ListItem[] = [
  {
    label: "Left Align",
    value: "leftAlign",
    icon: <Bars3BottomLeftIcon className="h-5 w-5" />,
    isActive: (editor) => editor.isActive({ textAlign: "left" }),
    action: (editor) => editor.chain().focus().setTextAlign("left").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("left").run(),
    shortcuts: ["mod", "shift", "l"],
  },
  {
    label: "Center Align",
    value: "centerAlign",
    icon: <Bars3CenterLeftIcon className="h-5 w-5" />,
    isActive: (editor) => editor.isActive({ textAlign: "center" }),
    action: (editor) => editor.chain().focus().setTextAlign("center").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("center").run(),
    shortcuts: ["mod", "shift", "m"],
  },
  {
    label: "Right Align",
    value: "rightAlign",
    icon: <Bars3BottomRightIcon className="h-5 w-5" />,
    isActive: (editor) => editor.isActive({ textAlign: "right" }),
    action: (editor) => editor.chain().focus().setTextAlign("right").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("right").run(),
    shortcuts: ["mod", "shift", "r"],
  },
  {
    label: "Justify Align",
    value: "justifyAlign",
    icon: <Bars3Icon className="h-5 w-5" />,
    isActive: (editor) => editor.isActive({ textAlign: "justify" }),
    action: (editor) => editor.chain().focus().setTextAlign("justify").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("justify").run(),
    shortcuts: ["mod", "shift", "j"],
  },
];

interface SectionSixProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: ListItemAction[];
  mainActionCount?: number;
  disabled?: boolean;
}

export const SectionSix: React.FC<SectionSixProps> = ({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 0,
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
        <>
          <Bars3Icon className="size-5" />
          <CaretDownIcon className="size-5" />
        </>
      }
      dropdownTooltip="Align & Indent"
      size={size}
      variant={variant}
      disabled={disabled}
    />
  );
};

SectionSix.displayName = "SectionSix";

export default SectionSix;
