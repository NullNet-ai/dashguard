'use client';
import { PlusCircle } from 'lucide-react';
import {
  registerDrawerType,
  useSideDrawer,
} from '~/components/platform/SideDrawer';
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

export default function CreateNewFilter({ initialTab }: any) {
  const { actions } = useSideDrawer();
  const { state, actions: gridActions } = useGrid();
  const { config, gridKey } = state ?? {};
  const isTimeline = config?.searchDialog === 'timeline'

  const {
    gridColumns: _columns = [],
    searchSuggestionConfig,
    entity: defaultEntity,
    enableCreateCustomGridFilter = true,
    customTabDefaults = {},
    onFetchRecords,
  } = config ?? {};

  if (!enableCreateCustomGridFilter) return null;

  const gridColumns = _columns.map((column: any, index: number) => ({
    header: column.header,
    accessorKey: column.accessorKey,
    label: column.header,
    isShow: column.isShow || true,
    order: column.order || index,
    search_config: column.search_config,
    entity: column.entity || defaultEntity,
    data_type: column.data_type,
    sortKey: column.sortKey,
    sort_config: column.sort_config,
    enableGrouping:
      typeof column.enableGrouping === 'boolean' ? column.enableGrouping : true,
    filter_config: column.filter_config,
    value_alias: column?.value_alias,
  }));

  const handleManageFilter = () => {
    const detaultFilter = initialTab?.default_filter?.length
      ? initialTab?.default_filter
      : (initialTab?.advance_filters ?? []);
    actions?.openSideDrawer({
      drawerType: 'manageFilter',
      header: <h1>New Filter</h1>,
      sideDrawerWidth: '900px',
      maxResizeWidth: '900px',
      isPinnable: true,
      resizable: true,

      body: {
        component: () => (
          <ManageFilterProvider
            tab={{
              name: 'New Filter',
              default_filter: isTimeline ? [] : detaultFilter?.filter(
                (filter: any) => filter?.default,
              ),
            }}
            isTimeline={isTimeline}
            filterType={isTimeline ? 'timeline' : 'default'}
            columns={gridColumns as Record<string, any>[]}
            searchConfig={{
              ...(searchSuggestionConfig ?? {}),
              entity: defaultEntity,
            }}
            gridKey={gridKey}
            customTabDefaults={customTabDefaults}
            onFetchRecords={onFetchRecords}
            gridActions={gridActions}
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
            className="h-full min-h-[36px] w-8 text-primary"
          >
            <PlusCircle className="h-5 w-5 fill-blue-700 text-white" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>New Filter</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
