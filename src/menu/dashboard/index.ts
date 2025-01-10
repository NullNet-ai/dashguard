import { headers } from "next/headers";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  title: "Dashboard",
  icon: "AcademicCapIcon",
  isActive: pathName.endsWith("/dashboard"),
  url: "/portal/dashboard",
  items: [],
};

export default menu;
