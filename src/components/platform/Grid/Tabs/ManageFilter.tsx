'use client';
import { CopyPlus, Table, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { Button } from '~/components/ui/button';
import { useGrid } from '../Provider';
import { duplicateFilterTab, removeGridFilter } from './SideDrawer/actions';
import { ManageFilterProvider } from './SideDrawer/Provider';
import GridManageFilter from './SideDrawer/View';

const ACTIONS = [
  {
    label: 'Manage Filter',
    id: 'manage_filter',
    icon: Table,
  },
  {
    label: 'Duplicate Filter',
    id: 'duplicate_filter',
    icon : CopyPlus
  },
  {
    label: 'Delete Filter',
    id: 'delete_filter',
    icon: Trash,
  },
];
export default function ManageFilter({ tab, tabs, entity }: { tab: any, entity: any, tabs : any[] }) {
  const router = useRouter();
  const { actions } = useSideDrawer();
  const { state } = useGrid();
  const { config } = state ?? {}; 

  const { columns = [], gridColumns : _gridColumns = [], searchConfig, entity : defaultEntity } = config ?? {};


  const gridColumns = _gridColumns?.map((column: any, index : number) => ({
    header: column.header,
    accessorKey: column.accessorKey,
    label: column.header,
    isShow: columns.some((col: any) => col.accessorKey === column.accessorKey) || false,
    order: column.order || index,
    data_type: column.data_type,
    entity: column.entity || defaultEntity,
    search_config: column.search_config,
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
            searchConfig={searchConfig}
          >
            <GridManageFilter />
          </ManageFilterProvider>
        ),
        componentProps: tab,
      },
    });
  };

  const handleDeleteFilter = async() => {

    const filteritems = tabs.filter((t: any) => t.id !== tab?.id);
    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
      
    localStorage.setItem('cachedPortalItems', JSON.stringify({
      ...cachedItems,
      [`grid_tab_${entity}`]: {
        ...cachedItems[`grid_tab_${entity}`],
        tabs: filteritems,
      },
    }))

    try {
      const url = await removeGridFilter(tab.id);

      //@temp fix
      router.refresh()
      

      // if (url && typeof url === 'string') {
      //   router.replace(url);
      // } else {
      //   router.refresh(); // Fallback: refresh the current page if no URL is returned
      // }
    } catch (error) {
      console.error('Error deleting filter:', error);
      router.refresh(); // Fallback: refresh the current page on error
    }
  };

  const handleDuplicateFilter = async() => {
    try {
      const url = await duplicateFilterTab(tab);
      if (url && typeof url === 'string') {
        router.push(url);
        router.refresh(); 
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error duplicating filter:', error);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col">
      {ACTIONS.filter(action => 
        !(tab.default && action.id === 'delete_filter')
      ).map((action) => (
        <Button
          key={action.id}
          Icon={action.icon}
          variant="ghost"
          iconPlacement="left"
          iconClassName="text-gray-400"
          className="ms-2"
          onClick={
            action.id === 'manage_filter'
              ? handleManageFilter
              : action.id === 'delete_filter'
              ? handleDeleteFilter
              : handleDuplicateFilter
          }
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}