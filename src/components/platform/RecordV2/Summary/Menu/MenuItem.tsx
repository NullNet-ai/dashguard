import { Fragment } from "react";
import { DropdownMenuItem, DropdownMenuSeparator } from "~/components/ui/dropdown-menu";

interface IMenuItemProps {
  children: React.ReactNode;
  onClick: () => void;
}

export default function MenuItem({ children, onClick,...props  }: IMenuItemProps) {
  const handleClick = () => {
    // ? Feel free to add your logic here
    onClick();
  }

  return (
    <Fragment>
      <DropdownMenuItem onClick={handleClick} {...props}>{children}</DropdownMenuItem>
      <DropdownMenuSeparator />
    </Fragment>
  );
}