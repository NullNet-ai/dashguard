import { getGridLink } from "~/lib/grid-get-link";
import { type ISidebarMenu } from "~/components/platform/SideBar/type";

const menu = {
  title: "Device",
  url: getGridLink({
    mainEntity: "device",
  }),
  icon: "ShieldCheckIcon",
} as ISidebarMenu;

export default menu;
