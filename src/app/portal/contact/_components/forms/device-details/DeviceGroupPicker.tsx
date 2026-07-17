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
import groupPickerColumns from './_config/group-picker-columns';
import groupPickerSorting from './_config/group-picker-sorting';

interface DeviceGroupPickerProps {
  contact_id: string;
  actions: any;
  onFetchRecords: () => void;
}

export default function DeviceGroupPicker({
  contact_id,
  actions,
  onFetchRecords,
}: DeviceGroupPickerProps) {
  const toast = useToast();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});
  const assignGroupsMutation = api.contactDevice.assignGroups.useMutation();

  const _pluck = ['id', 'code', 'name', 'status'];

  const { gridParams, gridProps } = useMemo(() => {
    const baseParams = gridDataResolver({
      entity: 'device_group_settings',
      pluck: _pluck,
      gridCacheData: gridCacheData as any,
      defaults: { defaultSorting: groupPickerSorting },
    });

    return baseParams;
  }, [gridCacheData]);

  useEffect(() => {
    getGridCacheData({
      pathname: '/portal/contact',
      defaultSorting: groupPickerSorting,
      entity: 'device_group_settings',
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
      advance_filters: [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: ['Active'],
          entity: 'device_group_settings',
        },
      ],
    },
    { router: 'deviceGroup', resolver: 'mainGrid' },
  );

  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  useEffect(() => {
    const params = {
      ...gridParams,
      advance_filters: [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: ['Active'],
          entity: 'device_group_settings',
        },
      ],
    };
    fetchData(params);
  }, [gridParams]);

  const handleSave = useCallback(async () => {
    if (selectedRows.length === 0) {
      // @ts-expect-error - No type yet
      toast.warning('Please select at least one device group');
      return;
    }

    try {
      const group_ids = selectedRows.map((row) => row.id);
      await assignGroupsMutation.mutateAsync({
        contact_id,
        group_ids,
      });

      toast.success('Device groups assigned successfully');
      actions.closeSideDrawer();
      onFetchRecords();
    } catch (err) {
      console.error('Assign groups failed:', err);
      toast.error('Failed to assign device groups');
    }
  }, [
    selectedRows,
    contact_id,
    assignGroupsMutation,
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
          entity: 'device_group_settings',
          title: 'Available Device Groups',
          columnsOrder: gridCacheData?.columns,
          columns: groupPickerColumns,
          enableRowSelection: true,
          enableCheckboxOnChange: true,
          enableRowClick: false,
          enableAutoCreate: false,
          disableDefaultAction: true,
          hideCreateButton: true,
          // @ts-expect-error - No type yet
          customBulkButtonConfig: { hidden: true },
          defaultShownColumns: ['name'],
          searchConfig: {
            router: 'deviceGroup',
            resolver: 'mainGrid',
            query_params: {
              entity: 'device_group_settings',
              pluck: _pluck,
            },
          },
          customTabDefaults: { defaultSorting: groupPickerSorting },
        }}
      />

      <div className="absolute inset-x-0 bottom-8 flex justify-end gap-2 border-t bg-background px-4 py-4">
        <Button
          variant="outline"
          onClick={() => actions.closeSideDrawer()}
          disabled={assignGroupsMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={assignGroupsMutation.isPending || selectedRows.length === 0}
          className="flex items-center gap-2"
        >
          {assignGroupsMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Save ({selectedRows.length} selected)
        </Button>
      </div>
    </div>
  );
}
