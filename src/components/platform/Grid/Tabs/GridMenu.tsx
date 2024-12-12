import { EllipsisVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import TabGridMenu from "./TabGridMenu";
import { api } from "~/trpc/server";
import { type ITabGrid } from "~/server/api/types";
import { headers } from "next/headers";

interface IProps {
  filter_id: string;
  tab?: ITabGrid;
}

const GridMenu = async ({ filter_id, tab }: IProps) => {

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , ] = pathname.split("/");
  
  if(tab?.name === `All ${main_entity?.toLowerCase()}`) return null

  const filter_by = await api.grid.getFilters({ filter_id }).then((data) => {
    if (!data)
      return {
        raw: [],
        converted: [],
      };
    return {
      raw: data,
      converted: data?.map((filter) => {
        return {
          field_label: filter.field,
          operator_label: filter.operator,
          values: filter.values,
        };
      }),
    };
  });

  const sort_by = await api.grid.getSorts({ filter_id }).then((data) => {
    if (!data) return null;
    return data;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <EllipsisVertical
            className={`text-default/60 h-4 w-4 font-semibold`}
            aria-hidden="true"
          />
        </div>
      </DropdownMenuTrigger>
      <TabGridMenu
        sort_by={sort_by}
        tab={tab}
        filter_by={filter_by}
        filter_id={filter_id}
      />
    </DropdownMenu>
  );
};

export default GridMenu;
