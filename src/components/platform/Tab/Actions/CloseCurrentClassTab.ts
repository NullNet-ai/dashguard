"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export const closeClassTab = async ({
  pathname,
  current,
}: {
  pathname: string;
  current?: boolean;
}) => {
  const headerList = headers();
  const currentPathname = headerList.get("x-pathname") || "";

  const tab = await api.tab.closeCurrentClassTab({
    href: pathname,
  });

  if (!current) {
    redirect(currentPathname);
  }

  redirect(tab?.href || "/portal/dashboard");
};
