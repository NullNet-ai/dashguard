import { getGridLink } from "~/lib/grid-get-link";
import { ISidebarMenu } from "~/components/platform/SideBar/type";

const menu = {
  title: "Remote Access",
  url: getGridLink({
    mainEntity: "device_remote_access_session",
  }),
  icon: "CommandLineIcon",
} as ISidebarMenu;

export default menu;