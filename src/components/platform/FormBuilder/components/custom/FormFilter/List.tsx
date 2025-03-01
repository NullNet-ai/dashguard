'use client';

import React, { useContext, useEffect, useState } from 'react';
import { ulid } from 'ulid';

import { WizardContext } from '~/components/platform/Wizard/Provider';
import { useSidebar } from '~/components/ui/sidebar';
import { useEventEmitter } from '~/context/EventEmitterProvider';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

import Grid from '../../../../Grid/Client';
import Skeleton from '../../../../Grid/Skeleton';
import { type IFilterGridConfig } from '../../../types/global/interfaces';

import { usePathname } from 'next/navigation';
import useDynamicWidth from './hooks/useDynamicWidth';

export default function FormFilterGrid({
  config,
  handleCloseGrid,
  handleSelectedGridRecords,
  handleListLoading,
  className,
  formKey,
}: {
  handleSelectedGridRecords: (records: any[]) => void;
  handleCloseGrid: () => void;
  handleListLoading: (loading: boolean) => void;
  className?: string;
  config: IFilterGridConfig;
  formKey?: string;
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
  const eventEmitter = useEventEmitter();
  const path = usePathname();
  const [, , , , versionNumber] = path.split('/');
  const [dynamicWizardContext, setDynamicWizardContext] = useState();
  useEffect(() => {
    if (!!process.env.NEXT_PUBLIC_IS_PLAYGROUND) {
      import(`~/components/platform/Wizard_${versionNumber}/Provider`).then(
        (e) => {
          setDynamicWizardContext(e.WizardContext);
        },
      );
    }
  }, [versionNumber]);
  const { state } = useContext(dynamicWizardContext ?? WizardContext);
  const { open } = useSidebar();

  const fetchData = () => {
    const router = searchConfig?.router || 'grid';
    const resolver = searchConfig?.resolver || 'items';
    const query_params = searchConfig?.query_params;
    const updateSearchItems = (query_params?.default_advance_filters ?? [])
      .length
      ? [
          ...(query_params?.default_advance_filters ?? []),
          // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
          ...(query_params?.default_advance_filters?.length > 1
            ? [{ id: ulid(), type: 'operator', operator: 'and' }]
            : []),
          ...[],
        ]
      : [];

    // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
    return api[router][resolver].useQuery({
      entity: filter_entity!,
      current,
      limit: limit || 100,
      pluck,
      advance_filters: updateSearchItems,
      sorting: [],
    });
  };

  const { data, isLoading, isError } = fetchData();

  const gridData = {
    ...data,
    advance_filters: [],
    sorting: [],
  };
  const selectedRecords = (config.selectedRecords || [])
    ?.map((record: any) => record?.id)
    .filter(Boolean) as string[];

  const { calcWidth, containerWidth } = useDynamicWidth(
    open,
    state ?? undefined,
    className,
  );
  handleListLoading(isLoading);
  if (isLoading) {
    return (
      <div className="bg-white">
        <Skeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center bg-white">
        <p>Error loading data</p>
      </div>
    );
  }

  const initialSelectedRecords = selectedRecords.reduce(
    (acc, id) => ({ ...acc, [id]: true }),
    {},
  );

  return (
    <div className={cn('w-full', containerWidth)}>
      <div className={cn(`${calcWidth}`)}>
        <Grid
          advanceFilter={gridData?.advance_filters || []}
          config={{
            statusesIncluded: config?.statusesIncluded ?? [
              'draft',
              'active',
              'Draft',
              'Active',
            ],
            entity: filter_entity!,
            title: label,
            columns: gridColumns!,
            actionType,
            // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
            searchConfig: searchConfig ?? {},
            // onFetchRecords: fetchData,
            rowClickCustomAction: ({ row, config }) => {
              if (
                row.original.id === _form_filter_selected_record?.[0]?.id ||
                !config?.statusesIncluded?.includes(row.original.status) ||
                !onSelectRecords
              )
                return;

              Promise.resolve(
                onSelectRecords({
                  rows: [row?.original],
                  main_entity_id: main_entity_id || '',
                  filter_entity: config?.entity,
                }),
              )?.then((data) => {
                eventEmitter.emit(`formStatus:${formKey}`, {
                  status: 'done',
                  form_key: formKey,
                });

                handleSelectedGridRecords(
                  Object.keys(data?.rows).length ? [data?.rows] : [],
                );
                handleCloseGrid();
              });
            },
          }}
          data={gridData?.items || []}
          defaultSorting={
            config?.searchConfig?.query_params?.default_sorting || []
          }
          height="300px"
          hideSearch={hideSearch}
          initialSelectedRecords={initialSelectedRecords}
          parentProps={{
            width: containerWidth,
            open,
            summary: state?.isSummaryOpen,
          }}
          parentType="form"
          showPagination={false}
          sorting={gridData?.sorting}
          totalCount={gridData?.totalCount || 0}
          onSelectRecords={(rows) => {
            if (!onSelectRecords) return;
            Promise.resolve(
              onSelectRecords({
                rows,
                main_entity_id,
                filter_entity,
              }),
            )?.then((data) => {
              eventEmitter.emit(`formStatus:${formKey}`, {
                status: 'done',
                form_key: formKey,
              });
              handleSelectedGridRecords(
                Object.keys(data?.rows).length ? [data?.rows] : [],
              );
              handleCloseGrid();
            });
          }}
          // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
          defaultAdvanceFilter={
            config?.searchConfig?.query_params?.default_advance_filters?.length
              ? config?.searchConfig?.query_params?.default_advance_filters
              : []
          }
        />
      </div>
    </div>
  );
}
