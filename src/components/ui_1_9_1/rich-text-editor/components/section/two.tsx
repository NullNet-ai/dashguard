import * as React from "react";
import type { Editor } from "@tiptap/react";
import { cn } from "~/lib/utils";
import { ChevronDownIcon as CaretDownIcon } from "@heroicons/react/20/solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ToolbarButton } from "../toolbar-button";

import type { toggleVariants } from "~/components/ui/toggle";
import type { VariantProps } from "class-variance-authority";
import { ALargeSmall } from "lucide-react";

interface TextStyle {
  label: string;
  fontFamily: string;
}

const formatActions: TextStyle[] = [
  {
    label: "Times New Roman",
    fontFamily: "Times New Roman, serif",
  },
  {
    label: "Georgia",
    fontFamily: "Georgia, serif",
  },
  {
    label: "Arial",
    fontFamily: "Arial, sans-serif",
  },
  {
    label: "Helvetica",
    fontFamily: "Helvetica, sans-serif",
  },
  {
    label: "Courier New",
    fontFamily: "Courier New, monospace",
  },
];

interface SectionTwoProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  disabled?: boolean;
}

export const SectionTwo: React.FC<SectionTwoProps> = React.memo(
  ({ editor, size, variant, disabled }) => {
    const handleFontFamilyChange = React.useCallback(
      (fontFamily: string) => {
        editor.chain().focus().setMark("textStyle", { fontFamily }).run();
      },
      [editor],
    );

    const renderMenuItem = React.useCallback(
      ({ label, fontFamily }: TextStyle) => {
        const fontFamilyWithoutType = fontFamily.split(",")[0];
        return (
          <DropdownMenuItem
            key={fontFamily}
            onClick={() => handleFontFamilyChange(fontFamily)}
            className={cn("flex flex-row items-center justify-between gap-4 disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted disabled:bg-background")}
            aria-label={label}
            disabled={disabled}
          >
            <span style={{ fontFamily }}>{fontFamilyWithoutType}</span>
          </DropdownMenuItem>
        );
      },
      [handleFontFamilyChange],
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton
            isActive={editor.isActive("textStyle", {
              fontFamily: editor.getAttributes("textStyle").fontFamily,
            })}
            tooltip="Font Family"
            aria-label="Font Family"
            pressed={editor.isActive("textStyle", {
              fontFamily: editor.getAttributes("textStyle").fontFamily,
            })}
            className="w-12 disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted disabled:bg-background"
            disabled={disabled || editor.isActive("codeBlock")}
            variant={variant}
            size={size}
          >
            <ALargeSmall className="h-5 w-5" />
            <CaretDownIcon className="h-5 w-5" />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-full disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted disabled:bg-background">
          {formatActions.map(renderMenuItem)}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

SectionTwo.displayName = "SectionTwo";

export default SectionTwo;
