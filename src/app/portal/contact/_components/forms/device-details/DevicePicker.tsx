'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EOperator } from '@dna-platform/common-orm';
import Grid from '~/components/platform/Grid';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import useFetchGridData from '~/hooks/useFetchGridData';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Loader2 } from 'lucide-react';
import pickerColumns from './_config/picker-columns';
import pickerSorting from './_config/picker-sorting';

interface DevicePickerProps {
  contact_id: string;
  actions: any;
  onFetchRecords: () => void;
}

export default function DevicePicker({
  contact_id,
  actions,
  onFetchRecords,
}: DevicePickerProps) {
  const toast = useToast();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});
  const assignMutation = api.contactDevice.assign.useMutation();

  const _pluck = ['id', 'code', 'device_name', 'status'];

  const { gridParams, gridProps } = useMemo(() => {
    const baseParams = gridDataResolver({
      entity: 'devices',
      pluck: _pluck,
      gridCacheData: gridCacheData as any,
      defaults: { defaultSorting: pickerSorting },
    });

    return baseParams;
  }, [gridCacheData]);

  useEffect(() => {
    getGridCacheData({
      pathname: '/portal/contact',
      defaultSorting: pickerSorting,
      entity: 'devices',
      application: 'grid',
    }).then((data) => {
      setGridCacheData(data ?? {});
    });
  }, []);

  const {
    fetchData,
    data: grid_data,
    isLoading,
  } = useFetchGridData(
    {
      ...gridParams,
      contact_id,
      advance_filters: [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: ['Active'],
          entity: 'devices',
        },
      ],
    },
    { router: 'contactDevice', resolver: 'assignableDevices' },
  );

  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  useEffect(() => {
    if (!contact_id) return;
    const params = {
      ...gridParams,
      contact_id,
      advance_filters: [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: ['Active'],
          entity: 'devices',
        },
      ],
    };
    fetchData(params);
  }, [contact_id]);

  const handleSave = useCallback(async () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one device');
      return;
    }

    try {
      const device_ids = selectedRows.map((row) => row.id);
      await assignMutation.mutateAsync({
        contact_id,
        device_ids,
      });

      toast.success('Devices assigned successfully');
      actions.closeSideDrawer();
      onFetchRecords();
    } catch (err) {
      console.error('Assign failed:', err);
      toast.error('Failed to assign devices');
    }
  }, [
    selectedRows,
    contact_id,
    assignMutation,
    actions,
    onFetchRecords,
    toast,
  ]);

  return (
    <div className="relative flex h-full flex-col gap-4 pb-16">
      <Grid
        {...gridProps}
        gridChildClass="!h-[calc(100vh-18em)]"
        totalCount={totalCount || 0}
        data={items}
        isLoading={isLoading}
        onSelectRecords={setSelectedRows}
        config={{
          isInfinite: false,
          entity: 'devices',
          title: 'Available Devices',
          columnsOrder: gridCacheData?.columns,
          columns: pickerColumns,
          enableRowSelection: true,
          enableCheckboxOnChange: true,
          enableRowClick: false,
          enableAutoCreate: false,
          disableDefaultAction: true,
          hideCreateButton: true,
          customBulkButtonConfig: { hidden: true },
          defaultShownColumns: ['device_name'],
          searchConfig: {
            router: 'contactDevice',
            resolver: 'assignableDevices',
            query_params: {
              entity: 'devices',
              pluck: _pluck,
              contact_id,
            },
          },
          customTabDefaults: { defaultSorting: pickerSorting },
        }}
      />

      <div className="absolute inset-x-0 bottom-8 flex justify-end gap-2 border-t bg-background px-4 py-4">
        <Button
          variant="outline"
          onClick={() => actions.closeSideDrawer()}
          disabled={assignMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={assignMutation.isPending || selectedRows.length === 0}
          className="flex items-center gap-2"
        >
          {assignMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Save ({selectedRows.length} selected)
        </Button>
      </div>
    </div>
  );
}
