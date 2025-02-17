import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { IMenuOptionConfig } from "../../types";
import { Fragment, useState } from "react";
import MenuItem from "./MenuItem";
import { formatFormTestID } from "~/lib/utils";
import { ChevronRight } from "lucide-react";

interface IRecursiveMenuItemProps {
  recordId: string;
  entityName: string;
  menuOptionConfig?: IMenuOptionConfig[];
  isMobile?: boolean;
}

export default function RecursiveMenuItem({
  menuOptionConfig = [],
  recordId,
  entityName,
  isMobile = false,
}: IRecursiveMenuItemProps) {
  const [menuItemLoadingState, setMenuItemLoadingState] = useState<
    Record<string, boolean>
  >({});

  const handleLoadingStateChange = (itemName: string, isLoading: boolean) => {
    setMenuItemLoadingState((prev) => ({
      ...prev,
      [itemName]: isLoading,
    }));
  };
  // ! All iterations should wrap the MenuItem component with a Fragment
  return menuOptionConfig.map((option) => (
    <Fragment key={recordId}>
      {(option.children && option.children.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2  text-left text-sm">
              <MenuItem
                onClick={option.onClick.bind(
                  null,
                  recordId,
                  entityName,
                  handleLoadingStateChange,
                )}
                data-test-id={
                  entityName +
                  "-rcrd-ddn-menu-" +
                  formatFormTestID(option.label)
                }
              >
                <ChevronRight className="size-5 text-default/40" />{" "}
                {option.label}
              </MenuItem>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side={isMobile ? 'left' : 'right'} className='z-[1000]'>
            <RecursiveMenuItem
              recordId={recordId}
              entityName={entityName}
              menuOptionConfig={option.children}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )) || (
        <div className="flex items-center gap-2 text-left text-sm">
          <MenuItem
            onClick={option.onClick.bind(
              null,
              recordId,
              entityName,
              handleLoadingStateChange,
            )}
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
