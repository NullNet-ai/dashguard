"use server";

import { redirect } from "next/navigation";
import { toRouteSegment } from "~/middleware-alias-entities";
import { api } from "~/trpc/server";

export async function Edit({
  entity,
  id,
  code,
  status,
}: {
  entity: string;
  id?: string;
  code?: string;
  status?: string;
}) {
  const response = await api.wizard.getCurrentStep({
    entity,
    identifier: code!,
  });

  const { identifier, step } = response ?? {};

  // `entity` is the ORM entity (e.g. `device_group_settings`) and must stay
  // that way for the tRPC call above. URL paths need the route segment
  // (e.g. `device_group`) — the folder that exists under src/app/portal.
  const routeSegment = toRouteSegment(entity);

  if (status === "Draft") {
    redirect(`/portal/${routeSegment}/wizard/${identifier}/${step}`);
  }

  redirect(`/portal/${routeSegment}/record/${code}/${routeSegment}`);
}
