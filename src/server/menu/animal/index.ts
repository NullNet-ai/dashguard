import { getGridLink } from "~/lib/grid-get-link";
import { ISidebarMenu } from "~/components/platform/SideBar/type";

const menu = {
  title: "Animal",
  url: getGridLink({
    mainEntity: "animal",
  }),
  icon: "QuestionMarkCircle",
} as ISidebarMenu;

export default menu;