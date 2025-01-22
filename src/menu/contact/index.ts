import { headers } from "next/headers";
import { getGridLink } from "~/lib/grid-get-link";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  title: "Contact",
  url: getGridLink({
    mainEntity: "contact",
  }),
  icon: "UserIcon",
  isActive: pathName.includes("/contact"),
};

export default menu;
