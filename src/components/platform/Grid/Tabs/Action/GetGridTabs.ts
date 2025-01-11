"use server";

import { api } from "~/trpc/server";

export async function GetGridTabs() {
  return await api.grid.getGridTabs();
}
