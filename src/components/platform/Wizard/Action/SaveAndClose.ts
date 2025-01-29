"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function SaveAndClose({
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


  redirect(`/portal/${entity}/grid`);
}
