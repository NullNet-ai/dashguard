import { cookies } from "next/headers";
import Image from "next/image";
import React from "react";

import AppSideBar from "~/components/platform/SideBar";
import { api } from "~/trpc/server";

import Clock from "./Clock";
import { MainMenuConfig } from "./config";
import SideUserInfo from "./UserInfo";

const getInitials = (name: string) => {
  const matches = name.match(/\b\w/g) || [];
  return ((matches.shift() || "") + (matches.pop() || "")).toUpperCase();
};

export default async function SideBarMenu() {
  const mainConfig = await MainMenuConfig();

  const { account_name, username, organization } =
    await api.record.getSessionInfo();
  const initials = getInitials(account_name);
  const cookieStore = cookies(); // Access cookies
  const screenType = cookieStore.get("screen-type");

  return (
    <AppSideBar
      footerComponent={
        <SideUserInfo
          user_name={account_name}
          initials={initials}
          email={username}
          screenType={screenType?.value}
          organization={organization}
        />
      }
      headerComponent={
        <div className="flex items-center justify-start py-1.5 text-sm lg:justify-center">
          <Image
            alt="Company Logo"
            className="h-8 w-auto"
            height={50}
            src="/tailwindLogo.svg"
            width={50}
          />
          <Clock />
        </div>
      }
      mainMenuConfig={mainConfig}
      screenType={screenType?.value}
    />
  );
}
