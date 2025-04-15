'use client';
import { PlusCircle } from 'lucide-react';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import GridManageFilter from './SideDrawer/View';
import { ManageFilterProvider } from './SideDrawer/Provider';
import { useGrid } from '../Provider';
import { Button } from '~/components/ui/button'; // Change to shadcn Button
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'; // Change to shadcn Tooltip

export default function CreateNewFilter() {
  const { actions } = useSideDrawer();
  const { state } = useGrid();
  const { config } = state ?? {};

  const { gridColumns : _columns = [], searchConfig, entity: defaultEntity } = config ?? {};
  
  const gridColumns = _columns.map((column: any, index: number) => ({
    header: column.header,
    accessorKey: column.accessorKey,
    label: column.header,
    isShow: column.isShow || true,
    order: column.order || index,
    search_config : column.search_config,
    entity : column.entity || defaultEntity,
    data_type: column.data_type,
  }));

  const handleManageFilter = () => {
    actions?.openSideDrawer({
      drawerType: 'manageFilter',
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider
            tab={{
              name: 'New Filter',
            }}
            columns={gridColumns as Record<string, any>[]}
            searchConfig={searchConfig}
          >
            <GridManageFilter />
          </ManageFilterProvider>
        ),
        componentProps: {},
      },
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleManageFilter}
            className="text-primary h-full w-8 mr-2"
          >
            <PlusCircle className="h-5 w-5 text-white fill-blue-700" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create New Filter</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
