"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function SaveAndContinue({
  entity,
  identifier,
  currentContext
}: {
  entity: string;
  identifier: string;
  currentContext: string;
}) {

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";

  await api.wizard.activator({
    entity,
    identifier,
  });

  const updatedPath = pathname.replace(/\/\d+$/, '/1');

  await api.tab.closeCurrentInnerClassTab({
    href: updatedPath,
    current_context: currentContext,
  })
  if (process.env.IS_PLAYGROUND) {
    redirect(`/portal/record/version/1/${identifier}/?current_tab=dashboard`);
  } else {
    redirect(`/portal/${entity}/record/${identifier}/?current_tab=dashboard`);
  }
}
