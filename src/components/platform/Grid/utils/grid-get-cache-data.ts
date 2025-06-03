'use server'
import { SortingState } from '@tanstack/react-table';
import { IGroupBy } from '~/components/platform/Grid/Category/type';
import {
  IPagination,
  ISearchItem,
} from '~/components/platform/Grid/Search/types';
import { api } from '~/trpc/server';

export interface IGridCacheDataResponse {
  filters: {
    advanceFilter: ISearchItem[];
    reportFilters: [];
    defaultFilters: ISearchItem[];
    groupAdvanceFilters: ISearchItem[];
  };
  sorts: {
    sorting: SortingState;
    defaultSorting: SortingState;
    groupSorts: SortingState;
  };
  pagination: IPagination;
  columns: Record<string, any>[];
  groups: IGroupBy[];
  grid_tabs: any[];
}
interface IGridCacheData {
  gridKey?: string;
  entity?: string;
  application?: string;
  identifier?: string;
  defaultGridTabs?: any[];
  pathname?: string;
  defaultSorting?: SortingState;
}

const defaultValues = {
  grid_tabs: [],
  sorts: {
    sorting: [],
    defaultSorting: [],
    groupSorts: [],
  },
  pagination: {
    current_page: 1,
    limit_per_page: 100,
  },
  filters: {
    advanceFilter: [],
    reportFilters: [],
    defaultFilters: [],
    groupAdvanceFilters: [],
  },
  columns: [],
  groups: [],
} as IGridCacheDataResponse;
export const getGridCacheData = async (
  args?: IGridCacheData,
): Promise<IGridCacheDataResponse> => {
  await api.grid.initializeGridTabs({ ...args });
  const cachedData = (await api.grid.getReportCachedData({
    ...args,
  })) as unknown as IGridCacheDataResponse;

  const gridCachedData =
    typeof cachedData === 'object' ? cachedData : defaultValues;

  return gridCachedData;
};
