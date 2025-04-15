'use client'
import { useSideDrawer } from "~/components/platform/SideDrawer";
import BasicDetails from "~/app/portal/device_remote_access_session/_components/forms/basic-details/client";


export const CustomNewButtonAction = () => {
  console.log("hello")
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

//  const handleOpenSideDrawer = async () => {
    actions.openSideDrawer(config as any);
//   };
}