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
import { useCallback, useEffect, useState } from "react";

interface FontSizeControlProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  defaultSize?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const FontSizeControl = ({
  editor,
  defaultSize = 16,
  min = 8,
  max = 96,
  step = 1,
  className,
  disabled,
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

  useEffect(() => {
    const updateFontSize = () => {
      const currentFontSize =
        editor.getAttributes("textStyle").fontSize || defaultSize;
      setFontSize(parseInt(currentFontSize, 10));
    };

    editor.on("transaction", updateFontSize);

    return () => {
      editor.off("transaction", updateFontSize);
    };
  }, [editor, defaultSize]);

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
        disabled={disabled}
      >
        <SelectTrigger className="w-14 border-0 p-0 disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted ">
          <div className="flex w-full items-center disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted ">
            <Input
              pattern="[0-9]*"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className={cn(
                "h-9 w-full rounded-md border-0 px-3 py-1 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted ",
                className,
              )}
              min={min}
              max={max}
              step={step}
              disabled={editor.isActive("codeBlock") || disabled}
            />
          </div>
        </SelectTrigger>
        <SelectContent className="flex items-center justify-center disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted ">
          {fontSizes.map((size) => (
            <SelectItem
              key={size}
              value={size.toString()}
              className="cursor-pointer items-center hover:bg-slate-100 disabled:opacity-100 disabled:cursor-auto hover:disabled:bg-transparent disabled:text-foreground disabled:bg-background disabled:border-muted "
              disabled={editor.isActive("codeBlock") || disabled}
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
