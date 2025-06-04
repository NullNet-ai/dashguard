'use client';

import { createContext, useContext, useState } from 'react';
import {
  saveGridFilter,
  transformFilterGroups,
  updateGridFilter,
} from './actions';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { useRouter } from 'next/navigation';
import { AppRouterKeys, IAction } from '../../types';
import { ISearchParams } from '../../Search/types';
import { api } from '~/trpc/react';

interface ManageFilterContextType {
  state: {
    tab_props: any;
    filterDetails: any;
    columns: Record<string, any>[];
    createFilterLoading: boolean;
    searchConfig: any;
  };
  actions: {
    handleUpdateFilter: (data: any) => void;
    handleCreateNewFilter: () => void;
    handleSaveFilter: () => void;
    saveUpdatedFilter: () => void;
  };
}

const ManageFilterContext = createContext<ManageFilterContextType | undefined>(
  undefined,
);

export function ManageFilterProvider({
  children,
  tab,
  columns,
  searchConfig,
  gridKey,
  customTabDefaults = {},
  onFetchRecords,
  gridActions,
  tabActions,
}: {
  children: React.ReactNode;
  tab: any;
  columns: Record<string, any>[];
  searchConfig?: {
    router?: AppRouterKeys;
    resolver?: string;
    query_params?: ISearchParams;
    entity?: string;
  };
  gridKey?: string;
  customTabDefaults?: Record<string, any>;
  onFetchRecords?: (args: any) => void;
  gridActions?: IAction;
  tabActions?: any
}) {
  const { actions } = useSideDrawer();
  const router = useRouter();
  const utils = api.useUtils();
  const { closeSideDrawer } = actions ?? {};
  const { handleUpdateTab } = tabActions ?? {};
  const [filterDetails, setFilterDetails] = useState<any>({
    sorts:
      customTabDefaults?.defaultSorting?.map((item: any) => {
        return {
          id: item.value || item.id,
          value: item.value || item.id,
          desc: item.desc,
        };
      }) || [],
    ...tab,
    columns,
  });
  const [createFilterLoading, setCreateFilterLoading] = useState(false);

  const handleUpdateFilter = (data: any) => {
    setFilterDetails({
      ...filterDetails,
      ...data,
    });
  };

  const handleSaveFilter = async () => {
    setCreateFilterLoading(true);
    const saveFilter = await saveGridFilter(filterDetails, gridKey);

    setCreateFilterLoading(false);
    return saveFilter;
  };

  const saveUpdatedFilter = async () => {
    await utils.invalidate();
    const sorting = filterDetails?.sorts?.length
      ? filterDetails.sorts.map((item: any) => {
          return {
            id: item.value || item.id,
            desc: item.desc,
          };
        })
      : [
          {
            id: 'created_date',
            desc: true,
          },
        ];

    const rawFilterGroup = JSON.parse(
      JSON.stringify(filterDetails?.filter_groups || []),
    ); // Deep copy to prevent modifications
    const { resolveDefaultFilter, resolveGroupFilter } =
      await transformFilterGroups({
        filterDetails,
        columns,
        grid_entity: searchConfig?.entity ?? '',
        customDefaultFilter: customTabDefaults?.defaultAdvanceFilter,
      });
    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: resolveDefaultFilter,
      sorts: sorting,
      default_sorts: sorting,
      filter_groups: rawFilterGroup,
      group_advance_filters: resolveGroupFilter,
      entity: searchConfig?.entity,
      advance_filters: resolveDefaultFilter
    };

    setCreateFilterLoading(true);
    const updatedCustomFilter = await updateGridFilter(
      modifyFilterDetails,
      gridKey,
    );
    setCreateFilterLoading(false);
    if (onFetchRecords) {
      gridActions?.handleUpdateGrouping(
        modifyFilterDetails?.groups?.map((item: any) => item.value),
      );
      onFetchRecords({
        grouping: modifyFilterDetails?.groups?.map((item: any) => item.field),
        advance_filters: resolveDefaultFilter,
        sorting: modifyFilterDetails?.sorts?.length
          ? modifyFilterDetails?.sorts
          : (modifyFilterDetails?.default_sorts ?? []),
        group_advance_filters: modifyFilterDetails?.group_advance_filters ?? [],
      });
      handleUpdateTab(modifyFilterDetails);
      router.refresh();
      closeSideDrawer();
      return;
    }
    await utils.invalidate();

    if (updatedCustomFilter?.href) {
      router.push(updatedCustomFilter.href);
      router.refresh();
    } else {
      router.refresh();
    }
    closeSideDrawer();
  };

  const handleCreateNewFilter = async () => {
    const sorting = filterDetails?.sorts?.length
      ? filterDetails.sorts.map((item: any) => {
          return {
            id: item.value || item.id,
            desc: item.desc,
          };
        })
      : [
          {
            id: 'created_date',
            desc: true,
          },
        ];

    const rawFilterGroup = JSON.parse(
      JSON.stringify(filterDetails?.filter_groups || []),
    ); // Deep copy to prevent modifications

    const { resolveDefaultFilter, resolveGroupFilter } =
      await transformFilterGroups({
        filterDetails,
        columns,
        grid_entity: searchConfig?.entity ?? '',
        customDefaultFilter: customTabDefaults?.defaultAdvanceFilter,
      });
    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: resolveDefaultFilter,
      sorts: sorting,
      default_sorts: sorting,
      filter_groups: rawFilterGroup,
      group_advance_filters: resolveGroupFilter,
      entity: searchConfig?.entity,
      groups: filterDetails?.groups?.length ? filterDetails.groups : [],
      advance_filters: resolveDefaultFilter,
    };
    setCreateFilterLoading(true);
    const createdCustomFilter = await saveGridFilter(
      modifyFilterDetails,
      gridKey,
    );
    setCreateFilterLoading(false);
    await utils.invalidate();
    router.push(createdCustomFilter?.href);
    closeSideDrawer();
  };

  return (
    <ManageFilterContext.Provider
      value={{
        state: {
          tab_props: tab,
          filterDetails,
          columns,
          createFilterLoading,
          searchConfig,
        },
        actions: {
          handleUpdateFilter,
          handleCreateNewFilter,
          handleSaveFilter,
          saveUpdatedFilter,
        },
      }}
    >
      {children}
    </ManageFilterContext.Provider>
  );
}

export const useManageFilter = () => {
  const context = useContext(ManageFilterContext);
  if (!context) {
    throw new Error('useManageFilter must be used within ManageFilterProvider');
  }
  return context;
};
