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
    (action: FormatAction) => {
      const handleClick = () => {
        action.action(editor);
      };
      
      return (
        <ToolbarButton
          key={action.label}
          className="pointer-events-auto"
          onClick={handleClick}
          disabled={disabled}
          isActive={action.isActive(editor)}
          tooltip={`${action.label} ${action.shortcuts.map((s) => getShortcutKey(s).symbol).join(" ")}`}
          aria-label={action.label}
          size={size}
          variant={variant}
        >
          {action.icon}
        </ToolbarButton>
      );
    },
    [editor, size, variant, disabled],
  );

  const renderDropdownMenuItem = React.useCallback(
    (action: FormatAction) => {
      const handleClick = () => {
        action.action(editor);
      };
      
      return (
        <DropdownMenuItem
          key={action.label}
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            "flex flex-row items-center justify-between gap-4",
            "cursor-pointer", // Ensure cursor shows it's clickable
            {
              "bg-accent": action.isActive(editor),
            },
          )}
          aria-label={action.label}
        >
          <span className="grow">{action.label}</span>
          <ShortcutKey keys={action.shortcuts} />
        </DropdownMenuItem>
      );
    },
    [editor, disabled],
  );

  return (
    <div className="flex items-center gap-0.5">
      {mainActions.map(renderToolbarButton)}
      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton
              className={cn("pointer-events-auto", dropdownClassName)}
              tooltip={dropdownTooltip}
              disabled={disabled}
              size={size}
              variant={variant}
            >
              {dropdownIcon || <ChevronDownIcon className="h-4 w-4" />}
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {dropdownActions.map(renderDropdownMenuItem)}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ToolbarSection;
