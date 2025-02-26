'use client';
import { PlusCircle } from 'lucide-react';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import GridManageFilter from './SideDrawer/View';
import { ManageFilterProvider } from './SideDrawer/Provider';
import { useGrid } from '../Provider';

export default function CreateNewFilter() {
  const { actions } = useSideDrawer();
  const { state } = useGrid();
  const { config } = state ?? {}; 

  const { columns = [] } = config ?? {};
  const gridColumns = columns?.slice(2).map((column: any, index : number) => ({
    header: column.header,
    accessorKey: column.accessorKey,
    label: column.header,
    isShow: column.isShow || true,
    order: column.order || index,
  }));
  
  const handleManageFilter = () => {
    actions?.openSideDrawer({
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider tab={{
            name: 'New Filter'
          }} columns={gridColumns}>
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
