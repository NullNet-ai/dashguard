"use server";
import { api } from "~/trpc/server";

interface IUpdateReportSorting {
  id: string;
  order_key: string;
  order_direction: string;
}

export const updateReportSorting = async (data: IUpdateReportSorting) => {
  const response = await api.report.updateReportSorting({
    ...data,
  });
  return response;
};
