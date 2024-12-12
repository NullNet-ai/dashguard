import { UserIcon } from "@heroicons/react/24/outline";

type Submenu = {
  id: string;
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  id: string;
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
};

type Group = {
  id?: string;
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      id: "11",
      groupLabel: "",
      menus: [
        {
          id: "1",
          href: "/",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: UserIcon,
          submenus: [],
        },
      ],
    },
    {
      id: "112",
      groupLabel: "Contents",
      menus: [
        // {
        //   id: "2",
        //   href: "",
        //   label: "Posts",
        //   active: pathname.includes("/posts"),
        //   icon: UserIcon,
        //   submenus: [
        //     {
        //       id: "222",
        //       href: "/posts",
        //       label: "All Posts",
        //     },
        //     {
        //       id: "2224",
        //       href: "/posts/new",
        //       label: "New Post",
        //     },
        //   ],
        // },
        // {
        //   id: "3",
        //   href: "/categories",
        //   label: "Categories",
        //   active: pathname.includes("/categories"),
        //   icon: UserIcon,
        // },
        {
          id: "324233",
          href: "/contact",
          label: "Contact",
          active: pathname.includes("/contact"),
          icon: UserIcon,
        },
      ],
    },
    {
      id: "1132422",
      groupLabel: "Settings",
      menus: [
        {
          id: "4",
          href: "/setting/general",
          label: "General",
          active: pathname.includes("/setting/general"),
          icon: UserIcon,
        },
        {
          id: "5",
          href: "/setting/menu",
          label: "Menu",
          active: pathname.includes("/setting/menu"),
          icon: UserIcon,
        },
      ],
    },
  ];
}
