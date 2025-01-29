import React from "react";

import Search from "./Search";
import RecordDetails from "./RecordDetails";
import { SidebarTrigger } from "~/components/ui/sidebar";
import MainTab from "~/components/platform/Tab/MainTab";
import { MobileTriggerComponent } from "./TriggerComponent";
import Image from "next/image";
const Header: React.FC = () => {
  return (
    <div>
      <header
        className={`col-span-full flex h-[3rem] items-center justify-center gap-4 bg-background md:h-14`}
      >
        {/* <SidebarTrigger Icon={TriggerComponent} className="hidden lg:block" /> */}

        <div className="relative flex w-full items-center border-b pb-1 lg:pb-0">
          <MainTab className="hidden md:flex" />
          <Logo />
          <div className="flex w-full items-center justify-end gap-3 sm:justify-normal md:justify-end">
            {/* // Hide search bar for now */}
            {/* <Search /> */}
            <RecordDetails />
          </div>
          <SidebarTrigger
            Icon={MobileTriggerComponent}
            className="mr-4 sm:mb-0 sm:hidden"
          />
        </div>
      </header>
      <div className="flex border-b sm:hidden sm:border-none">
        <MainTab className="w-full" />
      </div>
    </div>
  );
};

export default Header;

export function Logo() {
  return (
    <Image
      alt="Your Company"
      src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
      className="ml-4 mr-auto h-10 sm:hidden"
      width={40}
      height={40}
    />
  );
}
