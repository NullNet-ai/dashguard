"use server";

import { headers } from "next/headers";
import { api } from "~/trpc/server";

export async function SaveAndContinue({
  entity,
  identifier,
  currentContext,
  defaultRecordTab,
}: {
  entity: string;
  identifier: string;
  currentContext: string;
  defaultRecordTab?: string;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  await api.wizard.activator({
    entity,
    identifier,
  });

  const updatedPath = pathname.replace(/\/\d+$/, '/1');

  await api.tab.closeCurrentInnerClassTab({
    href: updatedPath,
    current_context: currentContext,
  });
  
  // Return the URL instead of redirecting
  if (process.env.NEXT_PUBLIC_IS_PLAYGROUND) {
    return `/portal/record/version/1/${identifier}/?current_tab=dashboard`;
  } else {
    return `/portal/${entity}/record/${identifier}/${defaultRecordTab ?? entity}`;
  }
}
