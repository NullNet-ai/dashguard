import { headers } from "next/headers";
import { getGridLink } from "~/lib/grid-get-link";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  title: "Role",
  url: getGridLink({
    mainEntity: "user_role",
  }),
  icon: "UserIcon",
  isActive: pathName.includes("/user_role"),
};

export default menu;
