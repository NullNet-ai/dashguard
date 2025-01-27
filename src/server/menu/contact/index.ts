import { ISidebarMenu } from "~/components/platform/SideBar/type";
import { getGridLink } from "~/lib/grid-get-link";

const menu = {
  title: "Contact",
  url: getGridLink({
    mainEntity: "contact",
  }),
  icon: "UserIcon",
} as ISidebarMenu;

export default menu;
