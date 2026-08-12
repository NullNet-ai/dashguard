import { getGridLink } from '~/components/platform/Grid/utils/grid-get-link';
import { type ISidebarMenu } from "~/components/platform/SideBar/type";

const menu = {
  title: "Remote Access",
  url: getGridLink({
    mainEntity: "device_remote_access_session",
  }),
  icon: "/remote_access.png",
} as ISidebarMenu;

export default menu;
