import Image from 'next/image';
import React from 'react';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { MobileTriggerComponent } from './TriggerComponent';

const Header: React.FC = () => {
  return (
      <header className="col-span-full flex items-center justify-center gap-4 bg-background">
        {/* <SidebarTrigger Icon={TriggerComponent} className="hidden lg:block" /> */}

        <div className="relative flex w-full items-center border-b py-2.5 md:p-0">
          <Logo />
          <div className="flex items-center justify-end gap-3 sm:justify-normal md:justify-end">
            {/* // Hide search bar for now */}
            {/* <Search /> */}
          </div>
          <SidebarTrigger
            Icon={MobileTriggerComponent}
            className="ml-[7px] mr-4 sm:mb-0 md:hidden md:ml-0"
          />
        </div>
      </header>
  );
};

export default Header;

export function Logo() {
  return (
    <Image
      alt="Your Company"
      src="/appguard-logo.png"
      className="ml-4 mr-auto h-auto w-14 md:hidden"
      width={40}
      height={40}
    />
  );
}
