'use client';

import { PlusIcon } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '~/components/platform/Grid';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { Button } from '~/components/ui/button';
import useFetchGridData from '~/hooks/useFetchGridData';

import {
  defaultSorting,
  gridColumns,
  TO_HIDE_COLUMNS_WHEN_MOBILE,
} from './_config/columns';
import DevicePicker from './DevicePicker';
import UnassignRowAction from './UnassignRowAction';

const MEMBER_PLUCK = ['id', 'device_id', 'device_group_setting_id', 'status'];

interface DeviceGroupDevicesGridProps {
  device_group_setting_id: string;
}

export default function DeviceGroupDevicesGrid({
  device_group_setting_id,
}: DeviceGroupDevicesGridProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { actions } = useSideDrawer();

  const fullPathname = useMemo(() => {
    const search = searchParams?.toString();
    return `${pathname ?? ''}${search ? `?${search}` : ''}`;
  }, [pathname, searchParams]);

  const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});

  useEffect(() => {
    getGridCacheData({
      pathname: fullPathname,
      defaultSorting: defaultSorting,
      entity: 'device_groups',
      application: 'grid',
    }).then((data) => {
      setGridCacheData(data ?? {});
    });
  }, [fullPathname]);

  const { gridParams, gridProps } = useMemo(() => {
    const baseParams = gridDataResolver({
      entity: 'device_groups',
      pluck: MEMBER_PLUCK,
      gridCacheData: gridCacheData as any,
      defaults: { defaultSorting },
    });

    return {
      ...baseParams,
      gridParams: { ...baseParams.gridParams, device_group_setting_id },
    };
  }, [gridCacheData, device_group_setting_id]);

  const {
    fetchData,
    data: grid_data,
    isLoading,
  } = useFetchGridData(gridParams, {
    router: 'deviceGroup',
    resolver: 'members',
  });

  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  const handleFetchRecords = useCallback(
    (newArgs?: any) => {
      fetchData(newArgs ?? gridParams);
    },
    [fetchData, gridParams],
  );

  const openAssignDrawer = useCallback(() => {
    actions.openSideDrawer({
      title: 'Assign Devices',
      sideDrawerWidth: '1200px',
      sideDrawerHeight: '50%',
      enableHistory: true,
      body: {
        component: () => (
          <DevicePicker
            actions={actions}
            device_group_setting_id={device_group_setting_id}
            onFetchRecords={handleFetchRecords}
          />
        ),
        componentProps: {},
      },
      resizable: true,
      showResizeHandle: true,
      onCloseSideDrawer() {
        handleFetchRecords();
      },
    } as any);
  }, [actions, device_group_setting_id, handleFetchRecords]);

  return (
    <Grid
      {...gridProps}
      customCreateButton={
        <Button onClick={openAssignDrawer}>
          Assign <PlusIcon className="ml-2 h-4 w-4" />
        </Button>
      }
      data={items}
      gridChildClass="!h-[calc(100vh-12.6em)]"
      gridDesktopClass="w-3/4 h-3/4"
      isLoading={isLoading}
      totalCount={totalCount || 0}
      config={{
        isInfinite: true,
        entity: 'device_groups',
        title: 'Devices',
        columnsOrder: gridCacheData?.columns,
        columns: gridColumns,
        defaultValues: { id: 'id' },
        enableRowSelection: false,
        enableRowClick: false,
        enableAutoCreate: false,
        isChildGrid: true,
        defaultShownColumns: ['device_name', 'device_code', 'device_status'],
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        editCustomComponent: () => <></>,
        archiveCustomComponent: () => <></>,
        customRowAction: (props: any) => (
          <UnassignRowAction {...props} onFetchRecords={handleFetchRecords} />
        ),
        customTabDefaults: { defaultSorting },
        onFetchRecords: handleFetchRecords,
      }}
    />
  );
}
