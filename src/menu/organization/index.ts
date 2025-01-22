import { headers } from "next/headers";
import { getGridLink } from "~/lib/grid-get-link";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  title: "Organization",
  url: getGridLink({
    mainEntity: "organization",
  }),
  icon: "UserGroupIcon",
  isActive: pathName.includes("/organization"),
};

export default menu;
