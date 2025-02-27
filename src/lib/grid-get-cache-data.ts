import { SortingState } from '@tanstack/react-table';
import {
  IAdvanceFilter,
  IPagination,
  ISearchItem,
} from '~/components/platform/Grid/Search/types';
import { api } from '~/trpc/server';

interface IGridCacheDataResponse {
  filters: {
    advanceFilter: IAdvanceFilter[];
    reportFilters: [];
    defaultFilters: ISearchItem[];
  };
  sorting: SortingState;
  pagination: IPagination;
  columns : Record<string,any>[];
}
export const getGridCacheData =
  async (): Promise<IGridCacheDataResponse> => {
    const cachedData =
      (await api.grid.getReportCachedData()) as IGridCacheDataResponse;
    return typeof cachedData === 'object'
      ? cachedData
      : ({
          sorting: [],
          pagination: {
            current_page: 1,
            limit_per_page: 100,
          },
          filters: {
            advanceFilter: [],
            reportFilters: [],
            defaultFilters: [],
          },
          columns : []
        } as IGridCacheDataResponse);
  };
