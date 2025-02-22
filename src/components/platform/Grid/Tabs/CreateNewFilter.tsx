'use client';
import { PlusCircle } from 'lucide-react';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import GridManageFilter from './SideDrawer/View';
import { ManageFilterProvider } from './SideDrawer/Provider';

export default function CreateNewFilter() {
  const { actions } = useSideDrawer();

  const handleManageFilter = () => {
    actions?.openSideDrawer({
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider tab={{}}>
            <GridManageFilter />
          </ManageFilterProvider>
        ),
        componentProps: {},
      },
    });
  };

  return (
    <PlusCircle className="h-5 w-5 text-primary" onClick={handleManageFilter}/>
  );
}
