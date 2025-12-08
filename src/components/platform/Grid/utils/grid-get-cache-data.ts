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
    additionalFilters?: ISearchItem[];
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
  current_tab_id: string;
}
interface IGridCacheData {
  gridKey?: string;
  entity?: string;
  application?: string;
  identifier?: string;
  defaultGridTabs?: any[];
  pathname?: string;
  defaultSorting?: SortingState;
  additionalFilters?: ISearchItem[];
  defaultGrouping?: IGroupBy[];
  gridEntity?: string;
  defaultAdvanceFilter?: ISearchItem[];
  hideDefaultAllTab?: boolean;
}

const defaultValues = {
  current_tab_id: '',
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
