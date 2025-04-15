
"use client"
import { PlugZapIcon, UnplugIcon } from "lucide-react";
import { toast } from "sonner";
import BasicDetails from "~/app/portal/device_remote_access_session/_components/forms/basic-details/client";
import { useSideDrawer } from "~/components/platform/SideDrawer";
import { Button } from "~/components/ui/button";

export const CustomRowActions = ({ row }: { row: any }) => {
  const { original } = row;
  const { actions } = useSideDrawer();

  const config = {
    header: original?.code,
    title: `ID: ${original?.code}`,
    sideDrawerWidth: '760px',
    body: {
      component: BasicDetails,
      componentProps: {
        record_data: original,
        entity: 'device_remote_access_session',
        actions,
        metadata: {},
      },
    },
    resizable: true,
    showResizeHandle: true,
    onCloseSideDrawer() {
      
    },
  };

  const handleOpenSideDrawer = async () => {
    actions.openSideDrawer(config as any);
  };

  const handleDisconnect = () => {
    toast.info("Disconnecting...");
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" onClick={() => handleOpenSideDrawer()}>
      <PlugZapIcon className={`h-4 w-4 text-success`} />
      </Button>
      <Button variant="ghost" onClick={() => handleDisconnect()}>
      <UnplugIcon className={`h-4 w-4 text-danger`} />
      </Button>
    </div>
  );
};