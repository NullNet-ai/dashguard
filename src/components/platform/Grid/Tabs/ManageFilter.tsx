'use client';
import { CopyPlus, Table, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { Button } from '~/components/ui/button';
import { useGrid } from '../Provider';
import { duplicateFilterTab, removeGridFilter } from './SideDrawer/actions';
import { ManageFilterProvider } from './SideDrawer/Provider';
import GridManageFilter from './SideDrawer/View';
import { DropdownMenuItem } from '~/components/ui/dropdown-menu';

const ACTIONS = [
  {
    label: 'Manage Filter',
    id: 'manage_filter',
    icon: Table,
  },
  {
    label: 'Duplicate Filter',
    id: 'duplicate_filter',
    icon: CopyPlus,
  },
  {
    label: 'Delete Filter',
    id: 'delete_filter',
    icon: Trash,
  },
];
export default function ManageFilter({
  tab,
  tabs,
  entity,
  actions: tabActions,
}: {
  tab: any;
  entity: any;
  tabs: any[];
  actions?: {
    handleDeleteTabs?: (tab: any) => void;
    handleDuplicateTab?: ({
      tab,
      gridKey,
      entity,
    }:{
      tab :any,
      gridKey : string,
      entity : string, 
    }) => void;
  };
}) {
  const router = useRouter();
  const { actions } = useSideDrawer();
  const { state, actions: gridActions } = useGrid();
  const { config, gridKey } = state ?? {};

  const {
    columns = [],
    gridColumns: _gridColumns = [],
    searchConfig,
    entity: defaultEntity,
    enableManageCustomGridFilter = true,
    customTabDefaults = {},
    onFetchRecords,
  } = config ?? {};

  const gridColumns = _gridColumns?.map((column: any, index: number) => ({
    header: column.header,
    accessorKey: column.accessorKey,
    label: column.header,
    isShow:
      columns.some((col: any) => col.accessorKey === column.accessorKey) ||
      false,
    order: column.order || index,
    data_type: column.data_type,
    entity: column.entity || defaultEntity,
    search_config: column.search_config,
    enableGrouping:
      typeof column.enableGrouping === 'boolean' ? column.enableGrouping : true,
  }));

  const handleManageFilter = () => {

    actions?.openSideDrawer({
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider
            tab={tab}
            columns={gridColumns}
            searchConfig={{
              ...searchConfig,
              entity: defaultEntity,
            }}
            customTabDefaults={customTabDefaults}
            gridKey={gridKey}
            onFetchRecords={onFetchRecords}
            gridActions={gridActions}
            tabActions={tabActions}
          >
            <GridManageFilter />
          </ManageFilterProvider>
        ),
        componentProps: tab,
      },
    });
  };
  const handleDeleteFilter = async () => {
    tabActions?.handleDeleteTabs?.(tab);
  };

  const handleDuplicateFilter = async () => {
    try {
      // const url = await duplicateFilterTab(tab, gridKey, defaultEntity);
      // if (url && typeof url === 'string') {
      //   router.push(url);
      //   router.refresh();
      // } else {
      //   router.refresh();
      // }
      tabActions?.handleDuplicateTab?.({
        tab,
        gridKey : gridKey || '',
        entity: defaultEntity || '',
      })
    } catch (error) {
      console.error('Error duplicating filter:', error);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col">
      {ACTIONS.filter(
        (action) =>
          !(tab.default && action.id === 'delete_filter') &&
          !(action.id === 'manage_filter' && !enableManageCustomGridFilter),
      ).map((action) => (
        <DropdownMenuItem
          key={action.id}
          onClick={
            (e) => {
              e.stopPropagation();
              action.id === 'manage_filter'
              ? handleManageFilter()
              : action.id === 'delete_filter'
                ? handleDeleteFilter()
                : handleDuplicateFilter()
            }
          }
          className="flex items-center gap-2 gap-x-3 rounded-md p-2 py-1.5 text-sm transition duration-100 hover:bg-gray-100"
        >
          <action.icon className="size-4 text-gray-500" />
          {action.label}
        </DropdownMenuItem>
      ))}
    </div>
  );
}
