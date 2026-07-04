'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '~/components/platform/Grid';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { handleArchive } from '~/components/platform/Grid/DefaultRow/Actions';
import { DefaultRowActions } from '~/components/platform/Grid/types';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import useFetchGridData from '~/hooks/useFetchGridData';
import { useToast } from '~/context/ToastProvider';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import CustomCreateButton from '../_components/custom_create_button';
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import defaultSorting from './_config/sorting';
import AuthorizeDeviceAction from './_components/AuthorizeDeviceAction';
import { ArchiveX, Loader2 } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const toast = useToast();
  const _navigate = api.wizard.getCurrentStep.useMutation();
  const utils = api.useUtils();
  const createSessionMutation =
    api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation();
  const archiveRecordMutation = api.grid.archiveRecord.useMutation();
  const [isArchiving, setIsArchiving] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPathname = useMemo(() => {
    const search = searchParams?.toString();
    return `${pathname ?? ''}${search ? `?${search}` : ''}`;
  }, [pathname, searchParams]);

  const [, , main_entity] = (pathname ?? '').split('/');

  const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!main_entity) return;
    getGridCacheData({
      pathname: fullPathname,
      defaultSorting: defaultSorting,
      entity: main_entity,
      application: 'grid',
    }).then((data) => {
      setGridCacheData(data ?? {});
    });
  }, [fullPathname, main_entity]);

  const _pluck = [
    'id',
    'code',
    'categories',
    'status',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
    'updated_by',
    // Project Columns
    'is_device_authorized',
    'device_name',
    'device_category',
    'device_type',
    'device_uuid',
    'is_device_online',
  ];

  const { gridParams, gridProps } = useMemo(() => {
    return gridDataResolver({
      entity: main_entity || 'device',
      pluck: _pluck,
      gridCacheData: gridCacheData as any,
      defaults: {
        defaultSorting,
      },
    });
  }, [gridCacheData, main_entity]);

  const {
    fetchData,
    data: grid_data,
    isLoading,
  } = useFetchGridData(gridParams, { router: 'device', resolver: 'mainGrid' });
  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  useEffect(() => {
    fetchData(gridParams);
  }, [gridParams]);

  const handleFetchRecords = useCallback(
    (newArgs?: any) => {
      fetchData(newArgs);
      if (newArgs?.grouping !== undefined) {
        getGridCacheData({
          pathname: fullPathname,
          defaultSorting: defaultSorting,
          entity: main_entity ?? 'device',
          application: 'grid',
        }).then((freshData) => {
          if (freshData) setGridCacheData(freshData);
        });
      }
    },
    [fetchData, fullPathname, main_entity],
  );

  const OnlineDeviceArchiveDialog = ({
    row,
    config,
    open,
    setOpen,
  }: DefaultRowActions) => {
    if (!row?.original?.is_device_online) return null;

    const handleClose = () => {
      setOpen && setOpen(false);
    };

    const isLoading = isArchiving;

    return (
      <Dialog
        open={!!open}
        onOpenChange={(nextOpen) => {
          setOpen && setOpen(nextOpen);
        }}
      >
        <DialogContent className="w-5/6 bg-white md:w-3/6">
          <div className="mb-2 text-sm">
            <ArchiveX
              size={35}
              className="rounded-full border border-red-300 bg-red-100 p-2 text-destructive"
            />
          </div>
          <div className="flex flex-1 gap-2 py-4 font-bold">Archive Record</div>
          <div className="flex flex-1 flex-col gap-2">
            <div>
              Are you sure you want to archive this record? Archiving will move
              the record to an inactive state, and it will no longer be
              available on the active list.
            </div>
            <div>
              <span className="font-bold">Note:</span> This device is currently
              online.
            </div>
          </div>
          <Separator className="my-2" />
          <DialogFooter className="py-2">
            <Button
              onClick={handleClose}
              className="mr-2"
              variant="ghost"
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsArchiving(true);
                try {
                  if (config?.archiveCustomAction) {
                    await config.archiveCustomAction(row.original);
                  } else {
                    handleArchive({ row, config });
                  }
                } finally {
                  setIsArchiving(false);
                  handleClose();
                }
              }}
              disabled={isLoading}
              variant="destructive"
              className="mr-2 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Grid
      {...gridProps}
      gridChildClass="!h-[calc(100vh-12.6em)]"
      totalCount={totalCount || 0}
      data={items}
      isLoading={isLoading}
      config={{
        isInfinite: true,
        entity: main_entity!,
        title: 'Devices',
        columnsOrder: gridCacheData?.columns,
        columns: gridColumns,
        defaultValues: {
          id: 'code',
        },
        // paginationType: 'default',
        enableRowSelection: false,
        enableAutoCreate: true,
        defaultShownColumns: ['created_date', 'updated_date'],
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        archiveDialogCustomComponent: OnlineDeviceArchiveDialog,
        archiveCustomAction: async (record: Record<string, any>) => {
          try {
            const services =
              await utils.deviceRemoteAccessSession.fetchDeviceServices.fetch({
                device_id: record.id,
                limit: 100,
              });

            const firstTtyService = (
              Array.isArray(services) ? (services as any[]) : []
            ).find((s: any) => s.item?.protocol === 'tty');

            if (firstTtyService) {
              const res = await createSessionMutation.mutateAsync({
                device_id: record.id,
                remote_access_type: 'tty',
                category: 'tty',
                device_service_id: firstTtyService.value,
              });

              const remote_access_session = (
                res?.data?.[0] as Record<string, any>
              )?.remote_access_session;

              if (res?.success && remote_access_session) {
                const wsUrl = `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_URL?.replace('https://', '')}/wallguard/gateway/tty`;

                await new Promise<void>((resolve) => {
                  const ws = new WebSocket(wsUrl);
                  const fallback = setTimeout(() => {
                    ws.close();
                    resolve();
                  }, 5000);

                  ws.onopen = () => {
                    // Shell isn't ready to receive input immediately on open, matching
                    // the wait in terminal/client.tsx before injecting commands.
                    setTimeout(() => {
                      ws.send('wallguard-cli leave\r');
                      setTimeout(() => {
                        ws.send('wallguard-cli stop\r');
                        setTimeout(() => {
                          clearTimeout(fallback);
                          ws.close();
                          resolve();
                        }, 2000);
                      }, 500);
                    }, 1500);
                  };
                  ws.onerror = () => {
                    clearTimeout(fallback);
                    resolve();
                  };
                  ws.onclose = () => {
                    clearTimeout(fallback);
                    resolve();
                  };
                });
              }
            }
          } catch (err) {
            console.error(
              '[archiveCustomAction] wallguard-cli leave failed',
              err,
            );
          }

          const result = await archiveRecordMutation.mutateAsync({
            entity: main_entity!,
            id: record.id,
          });
          handleFetchRecords();
          return result as Record<string, any>;
        },
        searchConfig: {
          router: 'device',
          resolver: 'mainGrid',
          query_params: {
            entity: main_entity!,
            pluck: _pluck,
            group_advance_filters: gridCacheData?.filters?.groupAdvanceFilters,
          },
        },
        customTabDefaults: {
          defaultSorting,
        },
        searchSuggestionConfig: {
          router: 'search',
          resolver: 'deviceSearch',
        },
        customRowAction: AuthorizeDeviceAction,
        rowClickCustomAction: ({ row }) => {
          if (!row?.original?.id) return;
          const edit = {
            entity: main_entity,
            code: row.original?.code,
            status:
              row.original?.status === 'Archived'
                ? (row.original?.previous_status ?? '')
                : row.original?.status,
          };

          if (edit?.status === 'Draft') {
            _navigate
              .mutateAsync({
                entity: edit?.entity ?? '',
                identifier: edit?.code ?? '',
              })
              .then((res) => {
                const { identifier, step } = res ?? {};
                router.push(
                  `/portal/${edit?.entity}/wizard/${identifier}/${step}`,
                );
              })
              .catch((err) => {
                toast.error('[Warning] Error fetching wizard data');
                console.warn('[Error fetching Wizard Data]', err);
              });
            return;
          }

          router.push(`/portal/${edit?.entity}/record/${edit?.code}/dashboard`);
        },
        onFetchRecords: handleFetchRecords,
      }}
      customCreateButton={
        <CustomCreateButton
          entity={main_entity!}
          onFetchRecords={handleFetchRecords}
        />
      }
    />
  );
}
