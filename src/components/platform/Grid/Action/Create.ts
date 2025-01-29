"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function Create({
  entity,
  defaultValues,
  enableAutoCreate = true,
  identifier,
  currentContext,
  is_from_grid = true,
}: {
  entity: string;
  defaultValues?: Record<string, any>;
  enableAutoCreate?: boolean;
  identifier?: string;
  currentContext?: string;
  is_from_grid: boolean;
}) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity] = pathname.split("/");
  const updated_path = pathname.replace(/\/\d+$/, "/1");

  if (!is_from_grid) {
    await api.wizard.activator({
      entity,
      identifier: identifier!,
    });

    // const last = updated_path.lastIndexOf("/");
    // const final_path = updated_path.substring(0, last);

    await api.tab.closeCurrentInnerClassTab({
      //remove the substring after the last "/"
      href: updated_path,
      current_context: currentContext!,
    });
  }

  // await api.contacts.generateTestContact();
  if (!enableAutoCreate) {
    redirect(`/portal/${entity}/wizard/new/1`);
  }
  const response = await api.wizard.createEntity({
    entity,
    defaultValues,
  });
  // to be able to redirect correctly if the entity is under a group menu item
  if (entity === mainEntity) {
    // redirect(`/portal/${entity}/wizard/${response?.data?.[0]?.id}/1`);
    redirect(`/portal/${entity}/wizard/${response?.data?.[0]?.code}/1`);
  }
  redirect(
    // `/portal/${mainEntity}/${entity}/wizard/${response?.data?.[0]?.id}/1`,
    `/portal/${mainEntity}/${entity}/wizard/${response?.data?.[0]?.code}/1`,
  );
}
