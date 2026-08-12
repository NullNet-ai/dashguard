import { getGridLink } from '~/components/platform/Grid/utils/grid-get-link';
import { ISidebarMenu } from "~/components/platform/SideBar/type";

const menu = {
  title: "Devices",
  url: getGridLink({
    mainEntity: "device",
  }),
  icon: "/device.svg",
} as ISidebarMenu;

export default menu;