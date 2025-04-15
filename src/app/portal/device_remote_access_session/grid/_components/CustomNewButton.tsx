
"use client"
import { LinkIcon } from "@heroicons/react/20/solid";
import BasicDetails from "~/app/portal/device_remote_access_session/_components/forms/basic-details/client";
import { useSideDrawer } from "~/components/platform/SideDrawer";
import { Button } from "~/components/ui/button";

export const CustomNewButton = () => {
  const { actions } = useSideDrawer();

  const config = {
    title: "New Remote Access",
    sideDrawerWidth: '760px',
    body: {
      component: BasicDetails,
      componentProps: {
        entity: 'device_remote_access_session',
        actions,
        metadata: {},
      },
    },
    resizable: true, // Enable resizing
    showResizeHandle: true, // Show the resize handle
    onCloseSideDrawer() {
      // Do things here
    },
  };

  const handleOpenSideDrawer = async () => {
    actions.openSideDrawer(config as any);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleOpenSideDrawer()}>
        <LinkIcon className={`h-4 w-4 text-secondary`} />
      </Button>
    </div>
  );
};