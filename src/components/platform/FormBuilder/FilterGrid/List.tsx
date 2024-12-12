"use client";

import { api } from "~/trpc/react";
import Grid from "../../Grid/Client";
import { type IFilterGridConfig } from "../type";
import Skeleton from "../../Grid/Skeleton";

export default function FormFilterGrid({
  config,
  handleCloseGrid,
  handleSelectedGridRecords,
  handleListLoading,
}: {
  handleSelectedGridRecords: (records: any[]) => void;
  handleCloseGrid: () => void;
  handleListLoading: (loading: boolean) => void;
  config: IFilterGridConfig;
}) {
  const {
    current,
    limit,
    actionType,
    pluck,
    label,
    gridColumns,
    main_entity_id,
    onSelectRecords,
    filter_entity,
  } = config;
  const selectedRecords = (config.selectedRecords || [])
    ?.map((record: any) => record?.id)
    .filter(Boolean) as string[];
  const [_, list] = api.grid.items.useSuspenseQuery({
    entity: filter_entity!,
    current,
    limit: limit || 100,
    pluck,
  });
  const { isLoading, data } = list ?? {};
  const { items, totalCount } = data ?? {};
  handleListLoading(isLoading);
  if (isLoading) {
    return (
      <div
        style={{
          width: "calc(100vw - 28rem)",
        }}
        className="bg-white"
      >
        <Skeleton />
      </div>
    );
  }

  const initialSelectedRecords = selectedRecords.reduce(
    (acc, id) => ({ ...acc, [id]: true }),
    {},
  );

  return (
    <Grid
      onSelectRecords={(rows) => {
        if (!onSelectRecords) return;
        Promise.resolve(
          onSelectRecords({
            rows,
            main_entity_id,
            filter_entity,
          }),
        )?.then((data) => {
          handleSelectedGridRecords(data?.rows || []);
          handleCloseGrid();
        });
      }}
      parentType="form"
      totalCount={totalCount || 0}
      data={items}
      config={{
        statusesIncluded: config?.statusesIncluded ?? [
          "draft",
          "active",
          "Draft",
          "Active",
        ],
        entity: filter_entity!,
        title: label,
        columns: gridColumns!,
        actionType,
      }}
      initialSelectedRecords={initialSelectedRecords}
    />
  );
}
