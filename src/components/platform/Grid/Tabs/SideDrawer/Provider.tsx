'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  getTabData,
  saveGridFilter,
  transformFilterGroups,
  updateGridFilter,
} from './actions';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { useRouter } from 'next/navigation';
import { AppRouterKeys } from '../../types';
import { ISearchParams } from '../../Search/types';
import { api } from '~/trpc/react';
import { IAction } from '~/components/platform/Grid/types';
import { formatSortingFields } from '../../utils/formatSortingFields';

interface ManageFilterContextType {
  state: {
    tab_props: any;
    filterDetails: any;
    columns: Record<string, any>[];
    createFilterLoading: boolean;
    searchConfig: any;
    customTabDefaults: Record<string, any>;
    filterType?: 'timeline' | 'default';
    errorMessages: string[]; // Changed from string to string array
    isTimeline?: boolean;
  };
  actions: {
    handleUpdateFilter: (data: any) => void;
    handleCreateNewFilter: () => void;
    handleSaveFilter: () => void;
    saveUpdatedFilter: () => void;
    setErrorMessages: (messages: string[]) => void; // Updated to handle arrays
  };
}

const ManageFilterContext = createContext<ManageFilterContextType | undefined>(
  undefined,
);

// Helper function to validate filter details and collect all errors
const validateFilterDetails = (
  filterDetails: any,
  setErrorMessages: (messages: string[]) => void,
  setCreateFilterLoading: (loading: boolean) => void,
): boolean => {
  const errors: string[] = [];

  // Validate filter name
  if (!filterDetails?.name?.trim()) {
    errors.push('Filter name is required.');
  }

  const sorts = filterDetails?.sorts ?? [];

  // Validate sorts have values or valid string IDs
  if (sorts.some((item: any) => {
    // Consider it valid if it has a value OR if it has an id that's a string and not a UUID/ULID
    const hasValue = !!item.value;
    const hasValidId = typeof item.id === 'string' && 
                      item.id.trim() !== '' && 
                      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id) && // Not UUID
                      !/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(item.id); // Not ULID
    
    return !hasValue && !hasValidId;
  })) {
    errors.push('One or more sorting rules are missing a valid field selection.');
  }

  // Validate all sorts have 'desc'
  if (sorts.some((item: any) => item.desc === undefined || item.desc === null)) {
    errors.push('One or more sorting rules are missing a direction.');
  }

  // Validate groups have values
  if (filterDetails?.groups?.some((item: any) => !item.value)) {
    errors.push('One or more grouping rules are missing a field selection.');
  }

  // Validate all groups have 'desc'
  if (filterDetails?.groups?.some(
    (item: any) => item.desc === undefined || item.desc === null
  )) {
    errors.push('One or more grouping rules are missing a direction.');
  }

  // If there are errors, set them and return false
  if (errors.length > 0) {
    setErrorMessages(errors);
    setCreateFilterLoading(false);
    return false;
  }

  return true;
};

// Helper function to prepare filter details for saving
const prepareFilterDetails = async (
  filterDetails: any,
  columns: Record<string, any>[],
  searchConfig: any,
  customTabDefaults: Record<string, any>,
): Promise<any> => {
  const sorts = filterDetails?.sorts ?? [];
  
  const sorting = sorts.length
    ? sorts.map((item: any) => ({
        id: item.value || item.id,
        desc: item.desc,
      }))
    : [
        {
          id: 'created_date',
          desc: true,
        },
      ];
  const resolvedSorting = formatSortingFields(sorting, columns as any);
  const rawFilterGroup = JSON.parse(
    JSON.stringify(filterDetails?.filter_groups || []),
  );

  const { resolveDefaultFilter, resolveGroupFilter } =
    await transformFilterGroups({
      filterDetails,
      columns,
      grid_entity: searchConfig?.entity ?? '',
      customDefaultFilter: customTabDefaults?.defaultAdvanceFilter,
    });

  const defaultAdvanceFilter = resolveDefaultFilter?.length
    ? resolveDefaultFilter
    : filterDetails?.default_filter;

  return {
    ...filterDetails,
    // default_filter: defaultAdvanceFilter,
    sorts: resolvedSorting,
    // default_sorts: resolvedSorting,
    filter_groups: rawFilterGroup,
    group_advance_filters: resolveGroupFilter,
    entity: searchConfig?.entity,
    groups: filterDetails?.groups?.length ? filterDetails.groups : [],
    advance_filters: defaultAdvanceFilter,
  };
};

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
  filterType = 'default',
  isTimeline = false,
}: {
  children: React.ReactNode;
  tab: any;
  filterType?: 'timeline' | 'default';
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
  tabActions?: any;
  isTimeline?: boolean;
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
  const [errorMessages, setErrorMessages] = useState<string[]>([]); // Changed to array

  const handleUpdateFilter = (data: any) => {
    setFilterDetails({
      ...filterDetails,
      ...data,
    });
    // Clear errors when user makes changes
    if (errorMessages.length > 0) setErrorMessages([]);
  };

  const handleSaveFilter = async () => {
    setCreateFilterLoading(true);
    const saveFilter = await saveGridFilter(filterDetails, gridKey);

    setCreateFilterLoading(false);
    return saveFilter;
  };

  const saveUpdatedFilter = async () => {
    await utils.invalidate();
    setCreateFilterLoading(true);
    setErrorMessages([]); // Clear any previous errors

    // Validate filter details
    if (!validateFilterDetails(filterDetails, setErrorMessages, setCreateFilterLoading)) {
      return;
    }

    try {
      // Prepare filter details for saving
      const modifyFilterDetails = await prepareFilterDetails(
        filterDetails,
        columns,
        searchConfig,
        customTabDefaults
      );

      const updatedCustomFilter = await updateGridFilter(
        modifyFilterDetails,
        gridKey,
      );

      await handleUpdateTab(modifyFilterDetails);
      if (onFetchRecords) {
        // gridActions?.handleUpdateGrouping(
        //   modifyFilterDetails?.groups?.map((item: any) => item.value),
        // );
        onFetchRecords({
          grouping: modifyFilterDetails?.groups?.map((item: any) => item.field),
          advance_filters: modifyFilterDetails.default_filter,
          sorting: modifyFilterDetails?.sorts?.length
            ? modifyFilterDetails.sorts
            : (modifyFilterDetails.default_sorts ?? []),
          group_advance_filters: modifyFilterDetails?.group_advance_filters ?? [],
        });
        router.refresh();
        closeSideDrawer();
        return;
      }
      setCreateFilterLoading(false);
      if (updatedCustomFilter?.href) {
        router.push(updatedCustomFilter.href);
        router.refresh();
      } else {
        router.refresh();
      }
      closeSideDrawer();
    } catch (error) {
      console.error(error);
      setErrorMessages(['An error occurred while updating the filter.']);
      setCreateFilterLoading(false);
    }
  };

  const handleCreateNewFilter = async () => {
    setCreateFilterLoading(true);
    setErrorMessages([]); // Clear any previous errors

    try {
      // Validate filter details
      if (!validateFilterDetails(filterDetails, setErrorMessages, setCreateFilterLoading)) {
        return;
      }

      // Prepare filter details for saving
      const modifyFilterDetails = await prepareFilterDetails(
        filterDetails,
        columns,
        searchConfig,
        customTabDefaults
      );

      const createdCustomFilter = await saveGridFilter(
        modifyFilterDetails,
        gridKey,
      );

      await utils.invalidate();
      setCreateFilterLoading(false);
      router.push(createdCustomFilter?.href);
      closeSideDrawer();
    } catch (error) {
      console.error(error);
      setErrorMessages(['An error occurred while creating the filter.']);
      setCreateFilterLoading(false);
    }
  };

  const fetchTabData = async () => {
    const tabData = await getTabData(tab?.id, gridKey);
    setFilterDetails({
     ...filterDetails,
     ...tabData,
    })
  }

  useEffect(() => {
    if (tab?.id) {
      fetchTabData()
    }
  }, [])

  return (
    <ManageFilterContext.Provider
      value={{
        state: {
          tab_props: tab,
          filterDetails,
          columns: filterDetails?.columns || columns,
          createFilterLoading,
          searchConfig,
          customTabDefaults,
          errorMessages, // Changed to array
          filterType,
          isTimeline,
        },
        actions: {
          handleUpdateFilter,
          handleCreateNewFilter,
          handleSaveFilter,
          saveUpdatedFilter,
          setErrorMessages, // Updated setter for error messages
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
