import { headers } from "next/headers";
import { EOperator } from "@dna-platform/common-orm";
import { api } from "~/trpc/server";
import Grid from "~/components/platform/Grid/Server";
import Bluebird from "bluebird";
import React from "react"; // Import React if needed
import gridColumns, {
  TO_HIDE_COLUMNS_WHEN_MOBILE,
} from "~/app/portal/contact/grid/_config/columns";

export default async function RecordTabContainer({
  searchParams = {},
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
}): Promise<React.ReactElement | null> {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , , identifier] = pathname.split("/");
  const _pluck = [
    "id",
    "code",
    "name",
    "parent_organization_id",
    "status",
    "created_date",
    "created_time",
    "created_by",
    "updated_date",
    "updated_time",
    "updated_by",
  ];

  const response = await api.organization.getByCode({
    code: identifier!,
    pluck_fields: ["id"],
  });
  const record_id = response?.data?.id;

  const { items = [], totalCount } = await api.grid
    .items({
      current: +(searchParams.page ?? "0"),
      limit: +(searchParams.perPage ?? "100"),
      entity: "organization",
      pluck: _pluck,
      advance_filters: [
        {
          type: "criteria",
          field: "parent_organization_id",
          operator: EOperator.EQUAL,
          values: [record_id!],
        },
      ],
    })
    .then(async (res) => {
      const final_items = await Bluebird.map(res.items, async (item) => {
        const final_item = await api.organization
        .getById({
          id: item.parent_organization_id ?? "",
          pluck_fields: ["name"],
        })
        .then((res) => {
          return {
            ...item,
            parent_organization_name: res?.data?.name,
          };
        });
        return final_item;
      });
      return {
        items: final_items,
        totalCount: res.totalCount,
      };
    });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      config={{
        entity: "organization",
        title: "Organizations",
        columns: gridColumns,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        layer: "sub",
      }}
    />
  );
}
