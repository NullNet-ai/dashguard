import { api } from "~/trpc/server";

export const getGridCacheData = async () => {
  const sorting = await api.grid.getReportSorting();
  const filters = await api.grid.getReportFilter() as Record<string, any>;
  const pagination = await api.grid.getReportPagination();

  return {
    sorting,
    filters,
    pagination,
  };
};
