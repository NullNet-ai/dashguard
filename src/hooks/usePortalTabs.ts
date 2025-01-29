import { useEffect } from "react";
import { type IPropsTabList } from "~/components/platform/Tab/type";

export function usePortalTabs(
  pathname: string,
  appendTab: (tab: IPropsTabList) => void,
  listMenu?: string[],
) {
  useEffect(() => {
    if (pathname.startsWith("/portal") && pathname !== "/portal") {
      const [, , /**Origin */ /**Portal */ mainEntity] = pathname.split("/");

      if (!mainEntity) return;
      if (listMenu?.includes(mainEntity)) {
        appendTab({
          name: mainEntity,
          href: pathname,
          current: false,
        });
      }
    }
  }, [appendTab, listMenu, pathname]);
}
