import { toCapitalize } from "~/lib/capitalize";
import GridMenu from "./GridMenu";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";

const GridTabs = async () => {
  const gridTabsData = await api.grid.getSessionGridTabs();
  return (
    <div className="flex flex-row gap-2">
      {gridTabsData?.map((tab) => {
        const active = tab.current ? "text-primary" : "text-foreground";
        return (
          <a
            href={tab?.href}
            key={tab.id}
            className="flex min-w-24 items-center justify-between rounded-md bg-tertiary p-2 px-3 py-2 pr-1 text-sm"
          >
            <span className={cn(active, "")}>{toCapitalize(tab.name)}</span>
            <GridMenu tab={tab} filter_id={tab?.id} />
          </a>
        );
      })}
    </div>
  );
};

export default GridTabs;
