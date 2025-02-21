import { useState } from 'react';
import { cn } from '~/lib/utils';
import StateTab from '~/components/platform/StateTab';
import FilterContent from './Tabs/Filter';
import Header from './Header';
import NameInput from './NameInput';
import ColumnContent from './Tabs/Columns';

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

type TabType = 'filter' | 'sort' | 'group' | 'columns';

export default function SideDrawer() {
  const [filterName, setFilterName] = useState('');
  const [conditions, setConditions] = useState<FilterCondition[]>([]);

  const tabs = [
    {
      id: 'filter',
      label: 'Filter',
      content: <FilterContent />,
    },
    {
      id: 'sort',
      label: 'Sort',
      content: (
        <div className="p-4 text-center text-gray-500">
          Sort functionality coming soon
        </div>
      ),
    },
    {
      id: 'group',
      label: 'Group',
      content: (
        <div className="p-4 text-center text-gray-500">
          Group functionality coming soon
        </div>
      ),
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

        <NameInput />

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
