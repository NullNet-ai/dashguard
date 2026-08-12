import { ISidebarMenu } from "~/components/platform/SideBar/type";
import { getGridLink } from "~/components/platform/Grid/utils/grid-get-link";

const menu = {
  title: "Timeline",
  url: getGridLink({
    mainEntity: "timeline",
  }),
  icon: "PresentationChartLineIcon",
} as ISidebarMenu;

export default menu;
