'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EOperator } from '@dna-platform/common-orm';
import Grid from '~/components/platform/Grid';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import useFetchGridData from '~/hooks/useFetchGridData';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import { gridColumns, TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import defaultSorting from './_config/sorting';
import AssignDeviceDrawerButton from './AssignDeviceDrawerButton';
import UnassignRowAction from './UnassignRowAction';

interface ContactDevicesGridProps {
  contact_id: string;
}

export default function ContactDevicesGrid({
  contact_id,
}: ContactDevicesGridProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const utils = api.useUtils();

  const fullPathname = useMemo(() => {
    const search = searchParams?.toString();
    return `${pathname ?? ''}${search ? `?${search}` : ''}`;
  }, [pathname, searchParams]);

  const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});

  useEffect(() => {
    getGridCacheData({
      pathname: fullPathname,
      defaultSorting: defaultSorting,
      entity: 'device_contacts',
      application: 'grid',
    }).then((data) => {
      setGridCacheData(data ?? {});
    });
  }, [fullPathname]);

  const _pluck = [
    'id',
    'device_id',
    'contact_id',
    'status',
    'created_date',
    'updated_date',
  ];

  const { gridParams, gridProps } = useMemo(() => {
    const baseParams = gridDataResolver({
      entity: 'device_contacts',
      pluck: _pluck,
      gridCacheData: gridCacheData as any,
      defaults: { defaultSorting },
    });

    return {
      ...baseParams,
      gridParams: {
        ...baseParams.gridParams,
        advance_filters: [
          ...(baseParams.gridParams.advance_filters ?? []),
          ...(baseParams.gridParams.advance_filters?.length
            ? [{ type: 'operator', operator: EOperator.AND }]
            : []),
          {
            type: 'criteria',
            field: 'contact_id',
            operator: EOperator.EQUAL,
            values: [contact_id],
            entity: 'device_contacts',
          },
          { type: 'operator', operator: EOperator.AND },
          {
            type: 'criteria',
            field: 'status',
            operator: EOperator.EQUAL,
            values: ['Active'],
            entity: 'device_contacts',
          },
        ],
      },
    };
  }, [gridCacheData, contact_id]);

  const {
    fetchData,
    data: grid_data,
    isLoading,
  } = useFetchGridData(gridParams, {
    router: 'contactDevice',
    resolver: 'mainGrid',
  });

  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  const isFirstFetch = useRef(true);
  useEffect(() => {
    // ponytail: useFetchGridData's useQuery already fires with the initial
    // gridParams on mount; skip this run to avoid a duplicate request.
    if (isFirstFetch.current) {
      isFirstFetch.current = false;
      return;
    }
    console.log('🚀 ~ ContactDevicesGrid ~ gridParams:', gridParams);
    fetchData(gridParams);
  }, [gridParams]);

  const handleFetchRecords = useCallback(
    (newArgs?: any) => {
      console.log("🚀 ~ ContactDevicesGrid ~ newArgs:", newArgs)
      console.log("🚀 ~ ContactDevicesGrid ~ gridParams:", gridParams)
      fetchData(newArgs ?? gridParams);
    },
    [fetchData, gridParams],
  );

  return (
    <Grid
      {...gridProps}
      gridChildClass="!h-[calc(100vh-12.6em)]"
      // Todo: To be fix by UI Team c/o Save. Already acknowledged by them
      gridDesktopClass="w-3/4 h-3/4"
      totalCount={totalCount || 0}
      data={items}
      isLoading={isLoading}
      config={{
        isInfinite: true,
        entity: 'device_contacts',
        title: 'Devices',
        columnsOrder: gridCacheData?.columns,
        columns: gridColumns,
        defaultValues: { id: 'id' },
        enableRowSelection: false,
        enableRowClick: false,
        enableAutoCreate: false,
        isChildGrid: true,
        defaultShownColumns: ['device_name'],
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        editCustomComponent: () => <></>,
        archiveCustomComponent: () => <></>,
        customRowAction: (props: any) => (
          <UnassignRowAction {...props} onFetchRecords={handleFetchRecords} />
        ),
        searchConfig: {
          router: 'contactDevice',
          resolver: 'mainGrid',
          query_params: {
            entity: 'device_contacts',
            pluck: _pluck,
          },
        },
        customTabDefaults: { defaultSorting },
        onFetchRecords: handleFetchRecords,
      }}
      customCreateButton={
        <AssignDeviceDrawerButton
          contact_id={contact_id}
          onFetchRecords={handleFetchRecords}
        />
      }
    />
  );
}
