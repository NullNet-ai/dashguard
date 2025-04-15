'use client'

import { EllipsisVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { api } from "~/trpc/server";
import { type ITabGrid } from "~/server/api/types";
import { useEffect, useState } from 'react';
import { get_filter_by, get_sort_by } from '../Action/getFilterby';
import TabGridMenu from '../TabGridMenu';

interface IProps {
  filter_id: string;
  tab?: ITabGrid;
  entity?: any
  current?: any
  tabs?: any[]
}

const GridMenuDropClient = ({ filter_id, tab, entity, tabs }: IProps) => {

    const [sort_by, setSort_by] = useState<any>(null)
    const [filter_by, setFilter_by] = useState<any>(null)


  // if(tab?.name === `All ${main_entity?.toLowerCase()}`) return null

 useEffect(() => {
    const fetchData = async () => {
      try {
        const [filterResult, sortResult] = await Promise.all([
          get_filter_by(filter_id),
          get_sort_by(filter_id)
        ]);
        
        setFilter_by(filterResult);
        setSort_by(sortResult);
      } catch (error) {
        console.error('error fetching data', error);
      }
    };

    fetchData();
  }, [filter_id]);
 

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
        entity={entity}
        tabs={tabs}
      />
    </DropdownMenu>
  );
};

export default GridMenuDropClient;
