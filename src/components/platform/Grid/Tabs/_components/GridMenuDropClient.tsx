'use client';

import { EllipsisVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

import { type ITabGrid } from '~/server/api/types';
import { useEffect, useState } from 'react';
import { get_filter_by, get_sort_by } from '../Action/getFilterby';
import TabGridMenu from '../TabGridMenu';

interface IProps {
  filter_id: string;
  tab?: ITabGrid;
  entity?: any;
  current?: any;
  tabs?: any[];
  actions: {
    handleDeleteTabs: (tab: any) => void;
    handleDuplicateTab?: (tab: any) => void;
  };
}

const GridMenuDropClient = ({
  filter_id,
  tab,
  entity,
  tabs,
  actions,
}: IProps) => {
  const [sort_by, setSort_by] = useState<any>(null);
  const [filter_by, setFilter_by] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  // if(tab?.name === `All ${main_entity?.toLowerCase()}`) return null

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filterResult, sortResult] = await Promise.all([
          get_filter_by(filter_id),
          get_sort_by(filter_id),
        ]);

        setFilter_by(filterResult);
        setSort_by(sortResult);
        setLoadedId(filter_id);
      } catch (error) {
        console.error('error fetching data', error);
      }
    };

    if (isMenuOpen && filter_id && loadedId !== filter_id) {
      void fetchData();
    }
  }, [isMenuOpen, filter_id, loadedId]);

  return (
    <DropdownMenu onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 px-0 py-1.5 text-left text-sm">
          <EllipsisVertical
            className={`h-3 w-3 font-semibold text-default/60`}
            aria-hidden="true"
          />
        </div>
      </DropdownMenuTrigger>
      <TabGridMenu
        actions={actions}
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
