import StateTab from '~/components/platform/StateTab'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import { useManageFilter } from './Provider'
import ColumnContent from './Tabs/Columns'
import FilterContent from './Tabs/Filter'
import GroupContent from './Tabs/Group'
import SortContent from './Tabs/Sort'

export default function SideDrawer({filter_type}: {filter_type: string}) {
  const { state, actions } = useManageFilter()
  const { tab_props, filterDetails, updateFilterLoading, createFilterLoading } = state ?? {}
  const tabs = [
    {
      id: 'filter',
      label: 'Filter',
      content: <FilterContent filter_type={filter_type}/>,
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
  ]

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end space-x-2">
        {tab_props.id
          ? (
              <>
              <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  loading={ updateFilterLoading }
                  variant="default"
                  onClick={() => {
                    return actions.saveUpdatedFilter()
                  } }
                >
                  ✓ Update Filter
                </Button>
              <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  loading={ createFilterLoading }
                  variant="default"
                  onClick={ actions.handleCreateNewFilter }
                >
                  {'✓ Create as New Filter'}
                </Button>
            </>
            )
          : (
              <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              loading={createFilterLoading}
              variant="default"
              onClick={actions.handleCreateNewFilter}
            >
                ✓ Create New Filter
            </Button>
            )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700" htmlFor = "filterName">
          Name
        </label>
        <div className="flex items-center justify-between">
          <Input
            className="max-w-full"
            id="filterName"
            placeholder="Filter Name"
            value={filterDetails.name}
            onChange={(e) => actions.handleUpdateFilter({
              name: e.target.value,
            })}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <StateTab
          defaultValue="filter"
          persistKey="side-drawer-tabs"
          size="sm"
          tabs={tabs}
          variant="default"
        />
      </div>
    </div>
  )
}
