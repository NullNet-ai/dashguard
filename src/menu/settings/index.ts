import { headers } from "next/headers";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  groupTitle: "Platform",
  groups: [
    {
      title: "Settings",
      icon: "Cog8ToothIcon",
      isActive: pathName.includes("/setting"),
      items: [require("./role").default],
    },
  ],
};

export default menu;
