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
import { ChevronRight } from "lucide-react";

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

  // ! All iterations should wrap the MenuItem component with a Fragment
  return menuOptionConfig.map((option) => (
    <Fragment key={recordId}>
      {(option.children && option.children.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <MenuItem
                onClick={option.onClick.bind(null, recordId, entityName)}
                data-test-id={
                  entityName +
                  "-rcrd-ddn-menu-" +
                  formatFormTestID(option.label)
                }
              >
               <ChevronRight  className="size-5 text-default/40"/> {option.label}
              </MenuItem>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right"  >
            <RecursiveMenuItem
              recordId={recordId}
              entityName={entityName}
              menuOptionConfig={option.children}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )) || (
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <MenuItem
            onClick={option.onClick.bind(null, recordId, entityName)}
            data-test-id={
              entityName + "-rcrd-menu-" + formatFormTestID(option.label)
            }
          >
            {option.label}
          </MenuItem>
        </div>
      )}
    </Fragment>
  ));
}
