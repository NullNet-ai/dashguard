import { headers } from "next/headers";

const headerList = headers();
const pathName = headerList.get("x-pathname") || "";

const menu = {
  title: "Favorite",
  icon: "StarIcon",
  isActive: pathName.includes("/favorite"),
  items: [],
  url: "/portal/favorite",
};

export default menu;
