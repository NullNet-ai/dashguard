import { headers } from "next/headers";
import { getGridLink } from "~/lib/grid-get-link";
import { ISidebarMenu } from "~/components/platform/SideBar/type";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  title: "DnaTestMenu",
  url: getGridLink({
    mainEntity: "dna_test_menu",
  }),
  icon: "QuestionMarkCircle",
  isActive: pathName.includes("/dna_test_menu"),
} as ISidebarMenu;;

export default menu;