import { headers } from "next/headers";
import { getGridLink } from "~/lib/grid-get-link";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  title: "ActivityLog",
  url: getGridLink({
    mainEntity: "activity_log",
  }),
  icon: "DocumentTextIcon",
  isActive: pathName.includes("activity_log"),
};

export default menu;
