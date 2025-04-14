import { getGridLink } from "~/components/platform/Grid/utils/grid-get-link";

const menu = {
  title: "Role",
  url: getGridLink({
    mainEntity: "user_role",
  }),
  icon: "UserIcon",
};

export default menu;
