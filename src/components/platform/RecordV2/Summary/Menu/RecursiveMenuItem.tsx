import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { IMenuOptionConfig } from "../../types";
import { Fragment } from "react";
import { DEFAULT_MENU_OPTION_CONFIG } from "../../constants";
import MenuItem from "./MenuItem";
import { formatFormTestID } from "~/lib/utils";

interface IRecursiveMenuItemProps {
  recordId: string;
  entityName: string;
  menuOptionConfig?: IMenuOptionConfig[];
}

export default function RecursiveMenuItem({
  menuOptionConfig = DEFAULT_MENU_OPTION_CONFIG,
  recordId,
  entityName,
}: IRecursiveMenuItemProps) {
  // return a JSX that expands the menu item to the left if it has children and isExpanded is true
  // ! All iterations should wrap the MenuItem component with a Fragment
  return menuOptionConfig.map((option) => (
    <Fragment key={recordId}>
      {(option.children.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <MenuItem
                onClick={option.onClick.bind(null, recordId, entityName)}
                data-test-id={entityName + "-rcrd-ddn-menu-" + formatFormTestID(option.label)}
              >
                {option.label}
              </MenuItem>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <RecursiveMenuItem
              recordId={recordId}
              entityName={entityName}
              menuOptionConfig={option.children}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )) || (
        <MenuItem onClick={option.onClick.bind(null, recordId, entityName)} data-test-id={
          entityName + "-rcrd-menu-" + formatFormTestID(option.label)
        }>
          {option.label}
        </MenuItem>
      )}
    </Fragment>
  ));
}
