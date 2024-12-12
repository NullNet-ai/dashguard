import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { VariantProps } from "class-variance-authority";
import { type toggleVariants } from "~/components/ui/toggle";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { useCallback, useState } from "react";

interface FontSizeControlProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  defaultSize?: number;
  min?: number;
  max?: number;
  step?: number;
}

const FontSizeControl = ({
  editor,
  defaultSize = 16,
  min = 8,
  max = 96,
  step = 1,
  className,
}: FontSizeControlProps & { className?: string }) => {
  const [fontSize, setFontSize] = useState(defaultSize);
  const [isOpen, setIsOpen] = useState(false);

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];

  const handleFontSizeChange = useCallback(
    (newSize: any) => {
      const numericSize = Number(newSize);
      if (!isNaN(numericSize) && numericSize >= min && numericSize <= max) {
        setFontSize(numericSize);
        editor.chain().focus().setFontSize(numericSize.toString()).run();
      }
    },
    [editor, min, max],
  );

  return (
    <div className="relative flex items-center">
      <Select
        open={isOpen}
        onOpenChange={setIsOpen}
        value={fontSize.toString()}
        onValueChange={(value) => {
          handleFontSizeChange(value);
          setIsOpen(false);
        }}
      >
        <SelectTrigger className="w-14 border-0 p-0">
          <div className="flex w-full items-center">
            <Input
              pattern="[0-9]*"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className={cn(
                "h-9 w-full rounded-md border-0 px-3 py-1 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                className,
              )}
              min={min}
              max={max}
              step={step}
              disabled={editor.isActive("codeBlock")}
            />
          </div>
        </SelectTrigger>
        <SelectContent className="flex items-center justify-center">
          {fontSizes.map((size) => (
            <SelectItem
              key={size}
              value={size.toString()}
              className="cursor-pointer items-center hover:bg-slate-100"
            >
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FontSizeControl;
