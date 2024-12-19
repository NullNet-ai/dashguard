import AppSideBar from "~/components/platform/SideBar";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/server";
import Clock from "./Clock";
import { MainMenuConfig } from "./config";
import FooterMenuConfig from "./footerMenuConfig copy";

const getInitials = (name: string) => {
  const matches = name.match(/\b\w/g) || [];
  return ((matches.shift() || "") + (matches.pop() || "")).toUpperCase();
};

export default async function SideBarMenu() {
  const mainConfig = await MainMenuConfig();

  const { contact } = await api.record.getSessionInfo();
  const initials = getInitials(contact?.first_name + " " + contact?.last_name);
  const user_name = contact?.first_name + " " + contact?.last_name;
  return (
    <AppSideBar
      mainMenuConfig={mainConfig}
      headerComponent={
        <div className="flex items-center justify-start lg:justify-center  py-1.5 text-sm">
          <Image
            width={50}
            height={50}
            alt="Company Logo"
            src="/tailwindLogo.svg"
            className="h-8 w-auto"
          />
          <Clock />
        </div>
      }
      footerComponent={
        <div className="grid">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                }
                alt={user_name}
              />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              {/* <span className="truncate font-semibold">{user_name}</span>
            <span className="truncate text-xs">{org_name}</span> */}
              <span className="truncate font-semibold">{user_name}</span>
              <span className="truncate text-xs">superadmin@dnamicro.com</span>
            </div>
          </div>
        </div>
      }
      footerMenuConfig={FooterMenuConfig}
    />
  );
}
