import { type ISidebarMenu } from "~/components/platform/SideBar/type";
import { api } from "~/trpc/server";

export const MainMenuConfig = async (): Promise<ISidebarMenu[]> => {
  return await api.menu.getMenuConfig();
};
