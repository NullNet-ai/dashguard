import { headers } from "next/headers";
import { ISidebarMenu } from "~/components/platform/SideBar/type";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  title: "Activity Log",
  icon: "DocumentTextIcon",
  isActive: pathName.includes("/activity_log"),
  items: [],
  url: "/portal/activity-log",
  separator: true,
} as ISidebarMenu;

export default menu;
