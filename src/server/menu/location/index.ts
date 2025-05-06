import { getGridLink } from '~/components/platform/Grid/utils/grid-get-link';
import { ISidebarMenu } from "~/components/platform/SideBar/type";

const menu = {
  title: "Location",
  url: getGridLink({
    mainEntity: "location",
  }),
  icon: "MapIcon",
} as ISidebarMenu;

export default menu;