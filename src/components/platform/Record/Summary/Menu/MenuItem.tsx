'use client'
import { Fragment } from "react";
import { RecordMenuOptionContext } from '~/components/RecordMenuOptionProvider/RecordMenuOptionsProvider';
import { DropdownMenuItem, DropdownMenuSeparator } from "~/components/ui/dropdown-menu";
import { cn } from '~/lib/utils';

interface IMenuItemProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function MenuItem({ children, onClick, className, ...props  }: IMenuItemProps) {
  

 
  const handleClick = () => {
    // ? Feel free to add your logic here
    onClick();
  }

  return (
    <Fragment>
      <DropdownMenuItem className={cn("w-full flex-1", className)} onClick={handleClick} {...props}>{children}</DropdownMenuItem>
      {/* TODO: add item separator */}
    </Fragment>
  );
}