"use client";
import { Button } from "@headlessui/react";
import { Header } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Files,
  ListFilter,
  Pencil,
  Pin,
} from "lucide-react";
import { useContext, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { GridContext } from "../Provider";
import { cn } from "~/lib/utils";

interface HeaderMenuProps {
  header: Header<any, unknown>;
}

const HeaderMenu = ({ header }: HeaderMenuProps) => {
  const { state } = useContext(GridContext);
  const sortingState = state?.sorting?.find((item) => item.id === header?.id);
  const enableSorting = header.column.getCanSort();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DropdownMenuTrigger asChild onClick={() => {
        setOpen(!open);
      }}>
        <Button className={cn(` group-hover:block group-hover:opacity-100`,
          `${open ? "opacity-100" : "opacity-0"}`
        )}>
          {
            !open ?   <ChevronDown className="h-4 w-4" />  : <ChevronUp className="h-4 w-4" />
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* <DropdownMenuItem className="flex gap-2">
          <Pencil className={`h-4 w-4`} aria-hidden="true" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex gap-2">
          <Files className={`h-4 w-4`} aria-hidden="true" />
          <span>Duplicate</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex gap-2">
          <Pin className="h-4 w-4" />
          <span>Pin Column</span>
        </DropdownMenuItem> */}
        {(!sortingState || sortingState.desc) && (
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => header.column.toggleSorting(false, true)}
          >
            <ArrowUp className="h-4 w-4" />
            <span>Sort by Ascending</span>
          </DropdownMenuItem>
        )}
        {(!sortingState || !sortingState.desc) && (
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => header.column.toggleSorting(true, true)}
          >
            <ArrowDown className="h-4 w-4" />
            <span>Sort by Descending</span>
          </DropdownMenuItem>
        )}
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem className="flex gap-2">
          <ListFilter className="h-4 w-4" />
          <span>Group by this field</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderMenu;
