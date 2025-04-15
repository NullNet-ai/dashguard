import { SortingState } from '@tanstack/react-table';
import {
  IPagination,
  ISearchItem
} from '~/components/platform/Grid/Search/types';
import { api } from '~/trpc/server';

interface IGridCacheDataResponse {
  filters: {
    advanceFilter: ISearchItem[];
    reportFilters: [];
    defaultFilters: ISearchItem[];
    groupAdvanceFilters: ISearchItem[];
  };
  sorts: {
    sorting: SortingState;
    defaultSorting: SortingState;
  };
  pagination: IPagination;
  columns : Record<string,any>[];
}
export const getGridCacheData =
  async (): Promise<IGridCacheDataResponse> => {
    const cachedData =
      (await api.grid.getReportCachedData() as unknown) as IGridCacheDataResponse;
    return typeof cachedData === 'object'
      ? cachedData
      : ({
        sorts: {
            sorting : [],
            defaultSorting : []
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
          columns : []
        } as IGridCacheDataResponse);
  };
