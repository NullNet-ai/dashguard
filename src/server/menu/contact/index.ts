import { getGridLink } from "~/lib/grid-get-link";

const menu = {
  title: "Contact",
  url: getGridLink({
    mainEntity: "contact",
  }),
  icon: "UserIcon",
};

export default menu;
