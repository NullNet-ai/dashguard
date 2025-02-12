import { getGridLink } from "~/lib/grid-get-link";
import { ISidebarMenu } from "~/components/platform/SideBar/type";

const menu = {
  title: "Accounts",
  url: getGridLink({
    mainEntity: "organization_account",
  }),
  icon: "UserGroupIcon",
} as ISidebarMenu;

export default menu;