'use client';
import { Table } from 'lucide-react';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { Button } from '~/components/ui/button';
import GridManageFilter from './SideDrawer';

export default function ManageFilter(tab : any) {
  const { actions } = useSideDrawer();

  const handleManageFilter = () => {
    actions?.openSideDrawer({
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => <GridManageFilter />,
        componentProps : tab
      },
    });
  };

  return (
      <Button
      onClick={handleManageFilter}
      Icon={Table}
      iconPlacement="left"
      iconClassName="text-gray-400"
      className="ms-2"
      variant={'ghost'}
    >
      Manage Filter
    </Button>
  );
}
