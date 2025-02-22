'use client';
import { CopyPlus, Table, Trash } from 'lucide-react';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { Button } from '~/components/ui/button';
import GridManageFilter from './SideDrawer/View';
import { ManageFilterProvider } from './SideDrawer/Provider';

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
export default function ManageFilter({ tab }: { tab: any }) {
  const { actions } = useSideDrawer();

  const handleManageFilter = () => {
    actions?.openSideDrawer({
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider tab={tab}>
            <GridManageFilter />
          </ManageFilterProvider>
        ),
        componentProps: tab,
      },
    });
  };

  const handleDeleteFilter = () => {
    console.info('delete filter');
  };

  const handleDuplicateFilter = () => {
    console.info('duplicate filter');
  };

  return (
    <div className="flex flex-col">
      {ACTIONS.map((action: any, index) => (
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