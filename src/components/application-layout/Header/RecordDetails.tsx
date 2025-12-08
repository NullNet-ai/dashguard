import React from "react";

import { DropdownMenu } from "~/components/ui/dropdown-menu";
import ThemeSwitcher from "~/components/platform/ThemeSwitcher";
import Notifications from "./Notifications/NotificationBadge";

export default async function RecordDetails() {
  return (
    <div className="mr-0 flex items-center">
      <DropdownMenu>
        <div className="relative flex items-start">
          <div className="hidden  lg:block">
            <ThemeSwitcher />
          </div>
          <Notifications />
        </div>
      </DropdownMenu>
    </div>
  );
}
