import React from "react";

import { DropdownMenu } from "~/components/ui/dropdown-menu";
import ThemeSwitcher from "~/components/platform/ThemeSwitcher";
import Notifications from "./Notifications/Notifications";

export default async function RecordDetails() {
  return (
    <nav className="mr-0 flex items-center lg:mr-6 md:mr-2 sm:mr-4">
      <DropdownMenu>
        <div className="relative flex items-center">
          <div className="hidden px-2 lg:block">
            <ThemeSwitcher />
          </div>
          <Notifications />
        </div>
      </DropdownMenu>
    </nav>
  );
}
