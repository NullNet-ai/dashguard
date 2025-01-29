
import { cookies } from "next/headers";
import Image from "next/image";
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

  const { contact } = await api.record.getSessionInfo();
  const { first_name, last_name, email } = contact;
  const initials = getInitials(first_name + " " + last_name);
  const user_name = first_name + " " + last_name;
  const cookieStore = cookies(); // Access cookies
  const screenType = cookieStore.get('screen-type'); 

  return (
    <AppSideBar
      mainMenuConfig={mainConfig}
      screenType={screenType?.value}
      headerComponent={
        <div className="flex items-center justify-start py-1.5 text-sm lg:justify-center">
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
        <SideUserInfo user_name={user_name} initials={initials} email={email}  screenType={screenType?.value}/>
      }

    />
  );
}
