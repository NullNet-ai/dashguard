
"use client"
import { PlusIcon } from "@heroicons/react/20/solid";
import BasicDetails from "~/app/portal/device_remote_access_session/_components/forms/basic-details/client";
import { useSideDrawer } from "~/components/platform/SideDrawer";
import { Button } from "~/components/ui/button";

// @ts-expect-error - No type yet
export const CustomNewButton = (props) => {
  const { deviceId, deviceCode } = props
  const { actions } = useSideDrawer();

  const config = {
    title: "New Remote Access",
    sideDrawerWidth: '1000px',
    enableHistory: true,
    body: {
      // @ts-expect-error - No type yet
      component: () => <BasicDetails deviceId={deviceId} deviceCode={deviceCode} />,
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
        New
        <PlusIcon className={`h-4 w-4 text-secondary`} />
      </Button>
    </div>
  );
};
