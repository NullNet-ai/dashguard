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
import { api } from '~/trpc/react';

import {
  defaultSorting,
  gridColumns,
  TO_HIDE_COLUMNS_WHEN_MOBILE,
} from './_config/columns';
import UserPicker from './UserPicker';

const MEMBER_PLUCK = [
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

interface RoleUsersGridProps {
  user_role_id: string;
}

export default function RoleUsersGrid({ user_role_id }: RoleUsersGridProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { actions } = useSideDrawer();

  const { data: sessionInfo } = api.record.getSessionInfo.useQuery();
  const isDeveloper =
    sessionInfo?.current_organization?.role?.toLowerCase() === 'developer';

  const fullPathname = useMemo(() => {
    const search = searchParams?.toString();
    return `${pathname ?? ''}${search ? `?${search}` : ''}`;
  }, [pathname, searchParams]);

  const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});

  useEffect(() => {
    getGridCacheData({
      pathname: fullPathname,
      defaultSorting,
      entity: 'contact',
      application: 'grid',
    }).then((data) => {
      setGridCacheData(data ?? {});
    });
  }, [fullPathname]);

  const { gridParams, gridProps } = useMemo(() => {
    const baseParams = gridDataResolver({
      entity: 'contact',
      pluck: MEMBER_PLUCK,
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
      title: 'Assign Users',
      sideDrawerWidth: '1200px',
      sideDrawerHeight: '50%',
      enableHistory: true,
      body: {
        component: () => (
          <UserPicker
            actions={actions}
            onFetchRecords={handleFetchRecords}
            user_role_id={user_role_id}
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
  }, [actions, user_role_id, handleFetchRecords]);

  return (
    <Grid
      {...gridProps}
      data={items}
      gridChildClass="!h-[calc(100vh-12.6em)]"
      gridDesktopClass="w-3/4 h-3/4"
      isLoading={isLoading}
      totalCount={totalCount || 0}
      customCreateButton={
        isDeveloper ? undefined : (
          // WP-832: gated on !isDeveloper, the same boundary every other
          // mutating control on a comparable page uses (see
          // device/grid/page.tsx — hideCreateButton / enableAutoCreate /
          // archiveCustomComponent / AssignDeviceGroupButton). Assigning a user
          // to a role is a mutation, so it does not silently hand developers a
          // capability they did not already have.
          <Button
            data-test-id="user-role-rcrd-assign-user-btn"
            onClick={openAssignDrawer}
          >
            Assign <PlusIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      }
      config={{
        isInfinite: true,
        entity: 'contact',
        title: 'Users',
        columnsOrder: gridCacheData?.columns,
        columns: gridColumns,
        defaultValues: { id: 'code' },
        enableRowSelection: false,
        enableRowClick: false,
        enableAutoCreate: false,
        hideCreateButton: isDeveloper,
        isChildGrid: true,
        defaultShownColumns: ['first_name', 'last_name', 'email'],
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        editCustomComponent: () => <></>,
        archiveCustomComponent: () => <></>,
        customTabDefaults: { defaultSorting },
        onFetchRecords: handleFetchRecords,
      }}
    />
  );
}
