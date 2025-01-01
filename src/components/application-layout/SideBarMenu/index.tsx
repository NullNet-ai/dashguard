import AppSideBar from "~/components/platform/SideBar";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/server";
import Clock from "./Clock";
import { MainMenuConfig } from "./config";
import FooterMenuConfig from "./footerMenuConfig copy";
import SideUserInfo from "./UserInfo";

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
        <SideUserInfo user_name={user_name} initials={initials} />
      }
      footerMenuConfig={FooterMenuConfig}
    />
  );
}
