"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { toRouteSegment } from "~/middleware-alias-entities";
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
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity] = pathname.split("/");
  const updated_path = pathname.replace(/\/\d+$/, "/1");

  // `entity` is the ORM entity (e.g. `device_group_settings`); `mainEntity`
  // comes from the URL and is therefore a ROUTE SEGMENT (e.g. `device_group`).
  // Comparing / interpolating the two directly 404s every aliased entity.
  // tRPC calls below keep using `entity`.
  const routeSegment = toRouteSegment(entity);

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
    return `/portal/${routeSegment}/wizard/new/1`
  }
  const response = await api.wizard.createEntity({
    entity,
    defaultValues,
  });
  // to be able to redirect correctly if the entity is under a group menu item
  if (routeSegment === mainEntity) {
    redirect(`/portal/${routeSegment}/wizard/${response?.data?.[0]?.code}/1`);
  }

  redirect(
    `/portal/${mainEntity}/${routeSegment}/wizard/${response?.data?.[0]?.code}/1`,
  );
}
