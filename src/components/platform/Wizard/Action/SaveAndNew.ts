"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function SaveAndNew({
  entity,
  identifier,
  currentContext,
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
  const updated_path = pathname.replace(/\/\d+$/, "/1");

  await api.tab.closeCurrentInnerClassTab({
    href: updated_path,
    current_context: currentContext,
  });

  const response = await api.wizard.createEntity({
    entity,
  });
  // redirect(`/portal/${entity}/wizard/${response?.data?.[0]?.id}`);
  redirect(`/portal/${entity}/wizard/${response?.data?.[0]?.code}`);
}
