import Image from 'next/image';
import React from 'react';

import MainTab from '~/components/platform/Tab/MainTab';
import { SidebarTrigger } from '~/components/ui/sidebar';

import RecordDetails from './RecordDetails';
import { MobileTriggerComponent } from './TriggerComponent';

const Header: React.FC = () => {
  return (
    <div>
      <header className="col-span-full flex items-center justify-center gap-4 bg-background ">
        {/* <SidebarTrigger Icon={TriggerComponent} className="hidden lg:block" /> */}

        <div className="relative flex w-full items-center border-b pb-1 pt-[11px] lg:pb-0 lg:pt-[7px]">
          <MainTab className="hidden md:flex" />
          <Logo />
          <div className="flex items-center justify-end gap-3 sm:justify-normal md:justify-end">
            {/* // Hide search bar for now */}
            {/* <Search /> */}
            <RecordDetails />
          </div>
          <SidebarTrigger
            Icon={MobileTriggerComponent}
            className="ml-[7px] mr-4 sm:mb-0 sm:hidden md:ml-0"
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
      src="/tailwindLogo.svg"
      className="ml-4 mr-auto h-10 sm:hidden"
      width={40}
      height={40}
    />
  );
}
