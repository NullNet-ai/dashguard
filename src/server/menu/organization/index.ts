import { ISidebarMenu } from "~/components/platform/SideBar/type";
import { getGridLink } from "~/lib/grid-get-link";

const menu = {
  title: "Organization",
  url: getGridLink({
    mainEntity: "organization",
  }),
  icon: "UserGroupIcon",
} as ISidebarMenu;

export default menu;
