import StateTab from '~/components/platform/StateTab';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useManageFilter } from './Provider';
import {FilterContent}  from './Tabs/Filter';


export default function SideDrawer({filter_type}: {filter_type: string}) {
  const { state, actions } = useManageFilter();
  const { tab_props, filterDetails, createFilterLoading } = state ?? {};
  console.log("%c Line:11 🍇 createFilterLoading", "color:#7f2b82", createFilterLoading);
  const tabs = [
    {
      id: 'filter',
      label: 'Filter',
      content: <FilterContent filter_type={filter_type}/>,
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end space-x-2">
        {tab_props.id ? (
          <>
            <Button
              variant="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={actions.saveUpdatedFilter}
              loading={createFilterLoading}
            >
              ✓ Update Filter
            </Button>
            <Button
              variant="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={actions.handleCreateNewFilter}
              loading={createFilterLoading}
            >
              ✓ Create as New Filter
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={actions.handleCreateNewFilter}
            loading={createFilterLoading}
          >
            ✓ Create New Filter
          </Button>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="filterName" className="text-sm font-bold text-gray-700">
          Name
        </label>
        <div className="flex items-center justify-between">
          <Input
            id="filterName"
            placeholder="Filter Name"
            value={filterDetails.name}
            onChange={(e) => actions.handleUpdateFilter({
              name: e.target.value
            })}
            className="max-w-full"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <StateTab
          defaultValue="filter"
          persistKey="side-drawer-tabs"
          tabs={tabs}
          variant="default"
          size="sm"
        />
      </div>
    </div>
  );
}
