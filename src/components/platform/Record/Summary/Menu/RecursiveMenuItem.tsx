'use client';
import { Loader2 } from 'lucide-react';
import { Fragment, useState } from 'react';
import {
  DropdownMenu
} from '~/components/ui/dropdown-menu';
import { formatFormTestID } from '~/lib/utils';
import { IMenuOptionConfig } from '../../types';
import MenuItem from './MenuItem';

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
            <div className="flex flex-col items-center text-center text-sm w-full">
            <RecursiveMenuItem
              recordId={recordId}
              entityName={entityName}
              menuOptionConfig={option.children}
            />
            </div>
        </DropdownMenu>
      )) || (
        <div className="flex items-center gap-2 text-sm w-full">
          <MenuItem
            className='cursor-pointer focus:bg-primary focus:text-white'
            onClick={option.onClick.bind(
              null,
              recordId,
              entityName,
              handleLoadingStateChange,
            )}
            data-test-id={
              entityName + '-rcrd-menu-' + formatFormTestID(option.label ?? '')
            }
            disabled={(option.disabled ?? false) || menuItemLoadingState[option.label ?? '']}
          >
            <div className="flex items-center gap-2">
              {option.label}
               {menuItemLoadingState[option.label ?? ''] && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
          </MenuItem>
        </div>
      )}
    </Fragment>
  ));
}
