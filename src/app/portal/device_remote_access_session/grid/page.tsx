"use server"
import { api } from "~/trpc/server";
import Grid from "~/components/platform/Grid/Server";
import { headers } from "next/headers";
import { getGridCacheData } from "~/lib/grid-get-cache-data";
import gridColumns from "./_config/columns";
import defaultSorting from "./_config/sorting";
import { CustomRowActions } from "./_components/CustomRowActions";
import { newButtonCustomAction } from "./_components/custom_actions";

export default async function Page() {
  const { sorts, pagination, filters } = (await getGridCacheData()) ?? {};

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity] = pathname.split("/");

  const _pluck = ["id", "code", "status", "remote_access_type", "device_id", "created_date", "updated_date", "created_by", "updated_by"];

  const { items = [], totalCount } = await api.deviceRemoteAccessSession.mainGrid({
    entity: main_entity!,
    pluck: _pluck,
    current: +(pagination?.current_page ?? "0"),
    limit: +(pagination?.limit_per_page ?? "100"),
    sorting: sorts?.defaultSorting?.length ? sorts.defaultSorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      defaultSorting={defaultSorting}
      sorting={sorts?.sorting?.length ? sorts?.sorting : []}
      config={{
        entity: main_entity!,
        title: "Remote Access",
        columns: gridColumns,
        defaultValues: {
          entity_prefix: "RA",
        },
        disableDefaultAction: true,
        customRowAction: CustomRowActions,
        // new_button_action: CustomNewButton
        // new_button_action: newButtonCustomAction
      }}
    />
  );
}
