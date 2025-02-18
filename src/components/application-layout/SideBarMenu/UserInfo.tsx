"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSidebar } from "~/components/ui/sidebar";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";

type SideInfoProps = {
  user_name?: string;
  email?: string;
  initials?: any;
  screenType?: string;
  organization?: string;
};

const SideUserInfo = ({
  user_name,
  email,
  initials,
  screenType,
  organization,
}: SideInfoProps) => {
  const { open, openMobile } = useSidebar();
  const screen = useScreenType() || screenType;
  const mobile = screen !== "lg" && screen !== "xl" && screen !== "2xl";

  return (
    <DropdownMenu >
      <DropdownMenuTrigger className="grid place-items-center px-2 active:ring-0 hover:ring-0">
          <div
            className={cn(
              `flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer`,
              `${(open || openMobile) && mobile ? "w-full" : ""} `
            )}
          >
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage
                // insert image src here for the user
                alt={user_name}
              />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                `grid flex-1 text-left text-sm leading-tight`,
                `${(open && !mobile) || (openMobile && mobile) || (open && !openMobile && !mobile) ? "" : "hidden"}`
              )}
            >
              <span className="truncate font-semibold">{user_name}</span>
              <span className="truncate text-xs">{email}</span>
              <span className="truncate text-xs">{organization}</span>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52" side='right' align='end' sideOffset={65}>
          <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <span className='font-medium mr-1'>My Organization </span> (Manager)</DropdownMenuItem>
            <DropdownMenuItem>
            <span className='font-medium mr-1'>Resilu </span> (Admin)
            </DropdownMenuItem>
            <DropdownMenuItem>
            <span className='font-medium mr-1'>My Organization </span> (Accountant)
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SideUserInfo;