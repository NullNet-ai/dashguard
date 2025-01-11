import { SortingState } from "@tanstack/react-table";
import {
  IAdvanceFilter,
  IPagination,
  ISearchItem,
} from "~/components/platform/Grid/Search/types";
import { api } from "~/trpc/server";

interface IGridCacheDataResponse {
  filters: {
    advanceFilter: IAdvanceFilter[];
    reportFilters: ISearchItem[];
    defaultFilters: ISearchItem[];
  };
  sorting: SortingState;
  pagination: IPagination;
}
export const getGridCacheData =
  async (): Promise<IGridCacheDataResponse | null> => {
    const cachedData =
      (await api.grid.getReportCachedData()) as IGridCacheDataResponse;
    return typeof cachedData === "object" ? cachedData : null;
  };
