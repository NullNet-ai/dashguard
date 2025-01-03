"use client";

import { api } from "~/trpc/react";
import Grid from "../../../../Grid/Client";

import Skeleton from "../../../../Grid/Skeleton";
import { IFilterGridConfig } from "../../../types/global/interfaces";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { WizardContext } from "~/components/platform/Wizard/Provider";
import { useContext, useMemo } from "react";

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
    grid_data,
    selectedRecords: _form_filter_selected_record,
  } = config;
  const { state } = useContext(WizardContext);
  const { open } = useSidebar();
  const selectedRecords = (config.selectedRecords || [])
    ?.map((record: any) => record?.id)
    .filter(Boolean) as string[];
  let grid_items: any[] = [];
  let grid_total_count = 0;
  let isLoading = false;
  if (grid_data) {
    grid_items = grid_data.items;
    grid_total_count = grid_data.totalCount;
  } else {
    const [_, list] = api.grid.items.useSuspenseQuery({
      entity: filter_entity!,
      current,
      limit: limit || 100,
      pluck,
    });
    const { isLoading: list_is_loading, data } = list ?? {};
    isLoading = list_is_loading;
    const { items, totalCount } = data ?? {};
    grid_items = items || [];
    grid_total_count = totalCount || 0;
  }

  const calcWidth = useMemo(() => {
    if (open && state?.isSummaryOpen) {
      return "w-[calc(100vw)]";
    } else if (!open && state?.isSummaryOpen) {
      return "w-auto";
    } else if (open && !state?.isSummaryOpen) {
      return "w-[calc(100vw-320px)]";
    } else return "";
  }, [open, state?.isSummaryOpen]);

  const containerWidth = useMemo(() => {
    if (open && state?.isSummaryOpen) {
      return "lg:w-[calc(100vw-550px)]";
    } else if (!open && state?.isSummaryOpen) {
      return "w-auto";
    } else if (open && !state?.isSummaryOpen) {
      return "w-[calc(100vw-320px)]";
    } else return "";
  }, [open, state?.isSummaryOpen]);

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
    <div className={cn("w-full overflow-x-auto", containerWidth)}>
      <div className={cn(`${calcWidth}`)}>
        <Grid
          height="300px"
          showPagination={false}
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
          totalCount={grid_total_count || 0}
          data={grid_items}
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
            rowClickCustomAction: ({ row, config }) => {
              if (row.original.id === _form_filter_selected_record?.[0]?.id)
                return;
              if (!config?.statusesIncluded?.includes(row.original.status))
                return;

              if (!onSelectRecords) return;
              Promise.resolve(
                onSelectRecords({
                  rows: [row?.original],
                  main_entity_id: main_entity_id || "",
                  filter_entity: config?.entity,
                }),
              )?.then((data) => {
                handleSelectedGridRecords(
                  Object.keys(data?.rows).length ? [data?.rows] : [],
                );
                handleCloseGrid();
              });
            },
          }}
          initialSelectedRecords={initialSelectedRecords}
        />
      </div>
    </div>
  );
}
