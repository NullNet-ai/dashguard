"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function UpdateCurrentSubTab({ tab_name }: { tab_name: string }) {
  await api.tab.updateCurrentSubTab({
    tab_name,
  });
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const [, , , , identifier] = pathName.split("/");
  if (tab_name && identifier) {
    const newPathname = pathName.replace(identifier, tab_name);
    redirect(newPathname);
  }
}
