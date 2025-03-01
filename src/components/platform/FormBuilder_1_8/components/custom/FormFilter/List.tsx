"use client";

import { api } from "~/trpc/react";
import Grid from "../../../../Grid/Client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { WizardContext } from "~/components/platform/Wizard/Provider";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import Skeleton from "../../../../Grid/Skeleton";
import { IFilterGridConfig, IGridData } from "../../../types/global/interfaces";
import { fetchRecords } from "./actions";
import { ulid } from "ulid";

export default function FormFilterGrid({
  config,
  handleCloseGrid,
  handleSelectedGridRecords,
  handleListLoading,
  className
}: {
  handleSelectedGridRecords: (records: any[]) => void;
  handleCloseGrid: () => void;
  handleListLoading: (loading: boolean) => void;
  className?: string;
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
    hideSearch,
    selectedRecords: _form_filter_selected_record,
    searchConfig,
  } = config;
  const { state } = useContext(WizardContext);
  const { open } = useSidebar();

  const [gridData, setGridData] = useState<IGridData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(
    async ({
      current,
      limit,
      pluck,
      advance_filters = [],
      sort = [],
    }: {
      current: number;
      limit: number;
      pluck: string[];
      advance_filters: any[];
      sort: any[];
    }) => {
      setIsLoading(true);
      try {
        if (Object.keys(searchConfig ?? {}).length) {
          const {
            router = "grid",
            resolver = "items",
            query_params,
          } = searchConfig ?? {};

          const updateSearchItems = query_params?.default_advance_filters.length
            ? [
                ...query_params?.default_advance_filters,
                ...(query_params?.default_advance_filters.length
                  ? [{ id: ulid(), type: "operator", operator: "and" }]
                  : []),
                ...advance_filters,
              ]
            : advance_filters;

          const result = await fetchRecords({
            advance_filters: updateSearchItems,
            pluck_fields: query_params?.pluck || [],
            router,
            resolver,
            sort,
          });
          setGridData({
            ...result,
            advance_filters,
            sorting : sort,
          });
        } else {
          const [_, list] = api.grid.items.useSuspenseQuery({
            entity: filter_entity!,
            current,
            limit: limit || 100,
            pluck,
          });
          const { isLoading: list_is_loading, data } = list ?? {};
          setIsLoading(list_is_loading);
          const { items, totalCount } = data ?? {};
          setGridData({ items: items || [], totalCount: totalCount || 0 });
        }
      } catch (error) {
        console.error("Error fetching grid data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filter_entity, searchConfig],
  );

  useEffect(() => {
    fetchData({
      current: current || 1,
      limit: limit || 100,
      pluck: pluck || [],
      advance_filters: [],
      sort: [],
    });
  }, []);

  const selectedRecords = (config.selectedRecords || [])
    ?.map((record: any) => record?.id)
    .filter(Boolean) as string[];

  const calcWidth = useMemo(() => {
    if (className) {
      return className
    } 
    if (open && state?.isSummaryOpen) {
      return "w-full";
    } else if (!open && state?.isSummaryOpen) {
      return "w-auto";
    } else if (open && !state?.isSummaryOpen) {
      return "w-[calc(100vw-320px)]";
    } else return "";
  }, [open, state?.isSummaryOpen, className]);

  const containerWidth = useMemo(() => {
    if (className) {
      return className
    }
    if (open && state?.isSummaryOpen) {
      return "lg:w-[calc(100vw-550px)]";
    } else if (!open && state?.isSummaryOpen) {
      return "w-auto";
    } else if (open && !state?.isSummaryOpen) {
      return "w-[calc(100vw-320px)]";
    } else return "";
  }, [open, state?.isSummaryOpen, className]);

  handleListLoading(isLoading);

  if (isLoading) {
    return (
      <div
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
    <div className={cn("w-full ", containerWidth)}>
      <div className={cn(`${calcWidth}`)}>
        <Grid
          height="300px"
          showPagination={false}
          parentProps={{
            width: containerWidth,
            open: open,
            summary: state?.isSummaryOpen
          }}
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
          hideSearch={hideSearch}
          parentType="form"
          totalCount={gridData?.totalCount || 0}
          data={gridData?.items || []}
          defaultSorting={config?.searchConfig?.query_params?.default_sorting || []}
          sorting={gridData?.sorting}
          advanceFilter={gridData?.advance_filters || []}
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
            searchConfig,
            onFetchRecords: fetchData,
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
