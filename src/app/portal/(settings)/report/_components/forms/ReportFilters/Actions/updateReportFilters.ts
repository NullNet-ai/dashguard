"use server";
import { api } from "~/trpc/server";

export const updateReportFilters = async (data: any) => {
  const response = await api.reportFilter.updateReportFilters({
    ...data,
  });
  return response;
};
