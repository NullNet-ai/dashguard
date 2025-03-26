'use client';

import { createContext, useContext, useState } from 'react';
import { saveGridFilter, transformFilterGroups, updateGridFilter } from './actions';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { useRouter } from 'next/navigation';
import { AppRouterKeys } from '../../types';
import { ISearchParams } from '../../Search/types';

interface ManageFilterContextType {
  state: {
    tab_props: any;
    filterDetails: any;
    columns: Record<string, any>[];
    createFilterLoading: boolean;
    searchConfig: any
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
}: {
  children: React.ReactNode;
  tab: any;
  columns: Record<string, any>[];
  searchConfig?: {
    router?: AppRouterKeys;
    resolver?: string;
    query_params?: ISearchParams;
  };
}) {
  const { actions } = useSideDrawer();
  const router = useRouter();
  const { closeSideDrawer } = actions ?? {};
  const [filterDetails, setFilterDetails] = useState<any>({
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
    const saveFilter = await saveGridFilter(filterDetails);

    setCreateFilterLoading(false);
    return saveFilter;
  };

  const saveUpdatedFilter = async () => {
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
    const { resolveDefaultFilter, resolveGroupFilter } = await transformFilterGroups(filterDetails, columns);
    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: resolveDefaultFilter,
      sorts: sorting,
      default_sorts: sorting,
      filter_groups: rawFilterGroup,
      group_advance_filters: resolveGroupFilter,
    };

    setCreateFilterLoading(true);
    await updateGridFilter(modifyFilterDetails);
    setCreateFilterLoading(false);
    closeSideDrawer();
    router.refresh();
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

    const { resolveDefaultFilter, resolveGroupFilter } = await transformFilterGroups(filterDetails, columns);

    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: resolveDefaultFilter,
      sorts: sorting,
      default_sorts: sorting,
      filter_groups: rawFilterGroup,
      group_advance_filters: resolveGroupFilter,
    };
    setCreateFilterLoading(true);
    await saveGridFilter(modifyFilterDetails);
    setCreateFilterLoading(false);
    closeSideDrawer();
    router.refresh();
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
