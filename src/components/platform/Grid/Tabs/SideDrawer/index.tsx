import { useState } from 'react';
import { cn } from '~/lib/utils';
import StateTab from '~/components/platform/StateTab';
import FilterContent from './Tabs/Filter';
import Header from './Header';
import NameInput from './NameInput';
import ColumnContent from './Tabs/Columns';
import SortContent from './Tabs/Sort';
import GroupContent from './Tabs/Group';
import { useSideDrawer } from '~/components/platform/SideDrawer';

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

type TabType = 'filter' | 'sort' | 'group' | 'columns';

export default function SideDrawer() {
  const { state } = useSideDrawer();
  const { config } = state || {};

  const { tab } = config?.body?.componentProps || {};
  
  const tabs = [
    {
      id: 'filter',
      label: 'Filter',
      content: <FilterContent />,
    },
    {
      id: 'sort',
      label: 'Sort',
      content: <SortContent />,
    },
    {
      id: 'group',
      label: 'Group',
      content: <GroupContent />,
    },
    {
      id: 'columns',
      label: 'Columns',
      content: <ColumnContent />,
    },
  ];

  return (
    <div>
      <div className="flex mx-4 h-full flex-col">
        <Header />

        <NameInput tab={tab}/>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto">
          <StateTab
            defaultValue="filter"
            persistKey="side-drawer-tabs"
            tabs={tabs}
            variant="default"
          />
        </div>


      </div>
    </div>
  );
}
