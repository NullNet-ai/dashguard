import { getGridLink } from "~/lib/grid-get-link";
import { ISidebarMenu } from "~/components/platform/SideBar/type";

const menu = {
  title: "Communication Template",
  url: getGridLink({
    mainEntity: "communication_template",
  }),
  icon: "EnvelopeIcon",
} as ISidebarMenu;

export default menu;