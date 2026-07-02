import { type ISidebarMenu } from "~/components/platform/SideBar/type";
import { api } from "~/trpc/server";

export const MainMenuConfig = async (
  role?: string | null,
): Promise<ISidebarMenu[]> => {
  return await api.menu.getMenuConfig({ role });
};
