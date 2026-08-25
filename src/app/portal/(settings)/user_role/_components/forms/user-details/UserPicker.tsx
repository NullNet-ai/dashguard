'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '~/components/platform/Grid';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { Button } from '~/components/ui/button';
import { useToast } from '~/context/ToastProvider';
import useFetchGridData from '~/hooks/useFetchGridData';
import { api } from '~/trpc/react';

import { defaultSorting, pickerColumns } from './_config/columns';

const PICKER_PLUCK = [
  'id',
  'code',
  'categories',
  'organization_id',
  'first_name',
  'middle_name',
  'last_name',
  'status',
  'created_date',
  'updated_date',
  'created_time',
  'updated_time',
  'created_by',
  'updated_by',
];

interface UserPickerProps {
  user_role_id: string;
  actions: any;
  onFetchRecords: () => void;
}

export default function UserPicker({
  user_role_id,
  actions,
  onFetchRecords,
}: UserPickerProps) {
  const toast = useToast();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});
  const assignMutation = api.user_role.assignUsers.useMutation();

  useEffect(() => {
    getGridCacheData({
      pathname: '/portal/user_role',
      defaultSorting,
      entity: 'contact',
      application: 'grid',
    }).then((data) => {
      setGridCacheData(data ?? {});
    });
  }, []);

  const { gridParams, gridProps } = useMemo(() => {
    const baseParams = gridDataResolver({
      entity: 'contact',
      pluck: PICKER_PLUCK,
      gridCacheData: gridCacheData as any,
      defaults: { defaultSorting },
    });

    return {
      ...baseParams,
      gridParams: { ...baseParams.gridParams, user_role_id },
    };
  }, [gridCacheData, user_role_id]);

  const {
    fetchData,
    data: grid_data,
    isLoading,
  } = useFetchGridData(gridParams, {
    router: 'user_role',
    resolver: 'assignableUsers',
  });

  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  const handleSave = useCallback(async () => {
    if (selectedRows.length === 0) {
      // @ts-expect-error - No type yet
      toast.warning('Please select at least one user');
      return;
    }

    try {
      await assignMutation.mutateAsync({
        user_role_id,
        contact_ids: selectedRows.map((row) => row.id),
      });

      toast.success('Users assigned successfully');
      actions.closeSideDrawer();
      onFetchRecords();
    } catch (err) {
      console.error('Assign failed:', err);
      toast.error('Failed to assign users');
    }
  }, [
    selectedRows,
    user_role_id,
    assignMutation,
    actions,
    onFetchRecords,
    toast,
  ]);

  return (
    <div className="relative flex h-full flex-col gap-4 pb-16">
      <Grid
        {...gridProps}
        data={items}
        gridChildClass="!h-[calc(100vh-18em)]"
        isLoading={isLoading}
        totalCount={totalCount || 0}
        onSelectRecords={setSelectedRows}
        config={{
          isInfinite: false,
          entity: 'contact',
          title: 'Available Users',
          columnsOrder: gridCacheData?.columns,
          columns: pickerColumns,
          enableRowSelection: true,
          enableCheckboxOnChange: true,
          enableRowClick: false,
          enableAutoCreate: false,
          disableDefaultAction: true,
          hideCreateButton: true,
          // @ts-expect-error - No type yet
          customBulkButtonConfig: { hidden: true },
          defaultShownColumns: ['first_name', 'last_name', 'email'],
          customTabDefaults: { defaultSorting },
          onFetchRecords: fetchData,
        }}
      />

      <div className="absolute inset-x-0 bottom-8 flex justify-end gap-2 border-t bg-background px-4 py-4">
        <Button
          disabled={assignMutation.isPending}
          variant="outline"
          onClick={() => actions.closeSideDrawer()}
        >
          Cancel
        </Button>
        <Button
          className="flex items-center gap-2"
          data-test-id="user-role-rcrd-assign-user-save-btn"
          disabled={assignMutation.isPending || selectedRows.length === 0}
          onClick={handleSave}
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
