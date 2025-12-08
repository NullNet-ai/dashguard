'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ulid } from 'ulid';

import { WizardContext } from '~/components/platform/Wizard/Provider';
import { useSidebar } from '~/components/ui/sidebar';
import { useEventEmitter } from '~/context/EventEmitterProvider';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

// Add these imports for the dialog
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import { ArchiveX, CheckCircle } from 'lucide-react';

import Grid from '../../../../Grid/SubGrid';
import Skeleton from '../../../../Grid/Skeleton';
import {
  IGridData,
  IReturnOnSelectRecords,
  type IFilterGridConfig,
} from '../../../types/global/interfaces';

import { usePathname } from 'next/navigation';
import useDynamicWidth from './hooks/useDynamicWidth';
import useFetchGridData from '~/hooks/useFetchGridData';
import { DefaultRowActions } from '~/components/platform/Grid/types';

// Add confirmation dialog component
// Add confirmation dialog component
const ConfirmationDialog = ({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  loading = false,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  loading?: boolean;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="w-5/6 bg-white md:w-3/6">
        <div className="mb-2 text-sm">
          <ArchiveX
            size={35}
            className={
              'rounded-full border border-red-300 bg-red-100 p-2 text-destructive'
            }
          />
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">{title}</div>
        <div className="flex flex-1 gap-2">{description}</div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <Button
            onClick={onCancel}
            className="mr-2"
            variant="ghost"
            color="primary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="mr-2"
            loading={loading}
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
    searchSuggestionConfig,
  } = config;

  const eventEmitter = useEventEmitter();
  const path = usePathname();
  const [, , , , versionNumber] = path.split('/');
  const [dynamicWizardContext, setDynamicWizardContext] = useState();
  const [gridData, setGridData] = useState<IGridData | null>(null);

  // Add confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    loading: boolean;
  }>({
    open: false,
    title: '',
    description: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
    loading: false,
  });

  const { state } = useContext(dynamicWizardContext ?? WizardContext);
  const { open } = useSidebar();
  const updateSearchItem = useMemo(() => {
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
    return updateSearchItems;
  }, [searchConfig?.query_params]);

  // const fetchData = () => {
  //   const router = searchConfig?.router || 'grid';
  //   const resolver = searchConfig?.resolver || 'items';

  //   // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
  //   return api[router][resolver].useQuery({
  //     entity: filter_entity!,
  //     current,
  //     limit: limit || 100,
  //     pluck,
  //     advance_filters: updateSearchItem,
  //     sorting: [],
  //   });
  // };

  // const { data, isLoading, isError } = fetchData();

  // const gridData = {
  //   ...data,
  //   advance_filters: [],
  //   sorting: [],
  // };

  const {
    fetchData,
    data,
    error: isError,
    isLoading,
  } = useFetchGridData(
    {
      entity: filter_entity!,
      current,
      limit: limit || 100,
      pluck,
      advance_filters: updateSearchItem,
      sorting: config?.searchConfig?.query_params?.default_sorting ?? [
        {
          id: 'created_date_time',
          desc: true,
        },
      ],
    },
    {
      router: searchConfig?.router || 'grid',
      resolver: searchConfig?.resolver || 'items',
    },
  );

  const selectedRecords = (config.selectedRecords || [])
    ?.map((record: any) => record?.id)
    .filter(Boolean) as string[];

  const { calcWidth, containerWidth } = useDynamicWidth(
    open,
    state ?? undefined,
    className,
  );
  handleListLoading(isLoading);
  if (isLoading && !data) {
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

  const handleActionSelectionConfirmation = ({
    row,
    config,
  }: DefaultRowActions) => {
    if (!onSelectRecords) return;
    Promise.resolve(
      onSelectRecords({
        rows: [row?.original],
        main_entity_id: main_entity_id || '',
        filter_entity: config?.entity,
      }),
    )?.then((data) => {
      // Check if confirmation is required
      if (data?.confirmation) {
        setConfirmationDialog({
          open: true,
          title: data.confirmation.title || 'Confirmation',
          description:
            data.confirmation.description ||
            'Are you sure you want to proceed?',
          onConfirm: () => handleWithConfirmation(data),
          loading: false,
        });
        return;
      }

      eventEmitter.emit(`formStatus:${formKey}`, {
        status: 'done',
        form_key: formKey,
      });
      eventEmitter.emit('record:summary_content');

      handleSelectedGridRecords(
        Array.isArray(data?.rows) ? data?.rows : [data?.rows],
      );
      handleCloseGrid();
    });
  };

  const handleRowConfirmation = (rows: any[]) => {
    if (!onSelectRecords) return;
    Promise.resolve(
      onSelectRecords({
        rows,
        main_entity_id,
        filter_entity,
      }),
    )?.then((data) => {
      // Check if confirmation is required
      if (data?.confirmation) {
        setConfirmationDialog({
          open: true,
          title: data.confirmation.title || 'Confirmation',
          description:
            data.confirmation.description ||
            'Are you sure you want to proceed?',
          onConfirm: () => handleWithConfirmation(data),
          loading: false,
        });
        return;
      }

      // No confirmation needed, proceed directly
      eventEmitter.emit(`formStatus:${formKey}`, {
        status: 'done',
        form_key: formKey,
      });
      eventEmitter.emit('record:summary_content');
      handleSelectedGridRecords(
        Array.isArray(data?.rows)
          ? data?.rows
          : data?.rows && Object.keys(data.rows).length > 0
            ? [data?.rows]
            : [],
      );
      handleCloseGrid();
    });
  };

  const handleWithConfirmation = (data: IReturnOnSelectRecords) => {
    setConfirmationDialog((prev) => ({ ...prev, loading: true }));

    // Process the confirmed action
    Promise.resolve(
      data?.confirmation?.onConfirm?.({
        rows: data?.rows,
        main_entity_id: data?.main_entity_id,
        filter_entity: data?.filter_entity,
      }),
    )
      .then((sData) => {
        eventEmitter.emit(`formStatus:${formKey}`, {
          status: 'done',
          form_key: formKey,
        });
        eventEmitter.emit('record:summary_content');

        handleSelectedGridRecords(
          Array.isArray(sData?.rows)
            ? sData?.rows
            : sData?.rows && Object.keys(sData.rows).length > 0
              ? [sData?.rows]
              : [],
        );

        setConfirmationDialog((prev) => ({
          ...prev,
          open: false,
          loading: false,
        }));
        handleCloseGrid();
      })
      .catch((error) => {
        console.error('Confirmation error:', error);
        setConfirmationDialog((prev) => ({ ...prev, loading: false }));
      });
  };

  const handleCancelConfirmation = () => {
    setConfirmationDialog((prev) => ({ ...prev, open: false, loading: false }));
  };

  return (
    <>
      <div className={cn('w-full', containerWidth)}>
        <div className={cn(`${calcWidth}`)}>
          <Grid
            advanceFilter={gridData?.advance_filters || []}
            isLoading={isLoading}
            sorting={gridData?.sorting || []}
            enableRevalidate={false}
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
              // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
              searchSuggestionConfig: searchSuggestionConfig,
              onFetchRecords: (data) => {
                fetchData(data);
                setGridData((prev) => ({ ...prev, ...data }));
              },
              rowClickCustomAction: ({ row, config }) => {
                if (
                  row.original.id === _form_filter_selected_record?.[0]?.id ||
                  !config?.statusesIncluded?.includes(row.original.status) ||
                  !onSelectRecords
                )
                  return;
                handleActionSelectionConfirmation({ row, config });
              },
            }}
            data={data?.items || []}
            defaultSorting={
              config?.searchConfig?.query_params?.default_sorting || []
            }
            height={
              data?.items?.length || 0 > 7 || data?.items?.length || 0 < 3
                ? '300px'
                : 'auto'
            }
            hideSearch={hideSearch}
            initialSelectedRecords={initialSelectedRecords}
            parentProps={{
              width: containerWidth,
              open,
              summary: state?.isSummaryOpen,
            }}
            parentType="form"
            showPagination={false}
            totalCount={data?.totalCount || 0}
            onSelectRecords={(rows) => {
              if (!onSelectRecords) return;
              handleRowConfirmation(rows);
            }}
            // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
            defaultAdvanceFilter={
              config?.searchConfig?.query_params?.default_advance_filters
                ?.length
                ? config?.searchConfig?.query_params?.default_advance_filters
                : []
            }
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={handleCancelConfirmation}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        loading={confirmationDialog.loading}
      />
    </>
  );
}
