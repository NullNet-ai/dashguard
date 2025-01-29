"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

const copyReportsAsync = async ({ filter_id }: { filter_id: string }) => {
  const { filter_href } = await api.grid.appendGridTab({
    filter_id,
  });
  redirect(filter_href);
};

export default copyReportsAsync;
