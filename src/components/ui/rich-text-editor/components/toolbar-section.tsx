import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { FormatAction } from "../types";
import type { VariantProps } from "class-variance-authority";
import type { toggleVariants } from "~/components/ui/toggle";
import { cn } from "~/lib/utils";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ToolbarButton } from "./toolbar-button";
import { ShortcutKey } from "./shortcut-key";
import { getShortcutKey } from "../utils";

interface ToolbarSectionProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  actions: FormatAction[];
  activeActions?: string[];
  mainActionCount?: number;
  dropdownIcon?: React.ReactNode;
  dropdownTooltip?: string;
  dropdownClassName?: string;
  disabled?: boolean;
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  editor,
  actions,
  activeActions = actions.map((action) => action.value),
  mainActionCount = 0,
  dropdownIcon,
  dropdownTooltip = "More options",
  dropdownClassName = "w-12",
  size,
  variant,
  disabled,
}) => {
  const { mainActions, dropdownActions } = React.useMemo(() => {
    const sortedActions = actions
      .filter((action) => activeActions.includes(action.value))
      .sort(
        (a, b) =>
          activeActions.indexOf(a.value) - activeActions.indexOf(b.value),
      );

    return {
      mainActions: sortedActions.slice(0, mainActionCount),
      dropdownActions: sortedActions.slice(mainActionCount),
    };
  }, [actions, activeActions, mainActionCount]);

  const renderToolbarButton = React.useCallback(
    (action: FormatAction) => (
      <ToolbarButton
        key={action.label}
        className="disabled:cursor-auto disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent"
        onClick={() => action.action(editor)}
        disabled={disabled}
        isActive={action.isActive(editor)}
        tooltip={`${action.label} ${action.shortcuts.map((s) => getShortcutKey(s).symbol).join(" ")}`}
        aria-label={action.label}
        size={size}
        variant={variant}
      >
        {action.icon}
      </ToolbarButton>
    ),
    [editor, size, variant],
  );

  const renderDropdownMenuItem = React.useCallback(
    (action: FormatAction) => (
      <DropdownMenuItem
        key={action.label}
        onClick={() => action.action(editor)}
        disabled={!action.canExecute(editor) && disabled}
        className={cn(
          "flex flex-row items-center justify-between gap-4 disabled:cursor-auto disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent",
          {
            "bg-accent": action.isActive(editor),
          },
        )}
        aria-label={action.label}
      >
        <span className="grow">{action.label}</span>
        <ShortcutKey keys={action.shortcuts} />
      </DropdownMenuItem>
    ),
    [editor],
  );

  const isDropdownActive = React.useMemo(
    () => dropdownActions.some((action) => action.isActive(editor)),
    [dropdownActions, editor],
  );

  return (
    <>
      {mainActions.map(renderToolbarButton)}
      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="disabled:cursor-auto disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent"
          >
            <ToolbarButton
              isActive={isDropdownActive}
              tooltip={dropdownTooltip}
              aria-label={dropdownTooltip}
              className={cn(dropdownClassName)}
              size={size}
              variant={variant}
              disabled={disabled}
            >
              {dropdownIcon || <ChevronDownIcon className="size-5" />}
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-full disabled:cursor-auto disabled:text-foreground disabled:opacity-100 hover:disabled:bg-transparent"
          >
            {dropdownActions.map(renderDropdownMenuItem)}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default ToolbarSection;
