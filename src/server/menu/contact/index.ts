import { ISidebarMenu } from "~/components/platform/SideBar/type";
import { getGridLink } from "~/components/platform/Grid/utils/grid-get-link";

const menu = {
  title: "Users",
  url: getGridLink({
    mainEntity: "contact",
  }),
  icon: "UserIcon",
} as ISidebarMenu;

export default menu;
