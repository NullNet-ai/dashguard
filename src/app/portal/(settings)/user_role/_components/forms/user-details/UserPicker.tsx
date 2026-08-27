'use client';

import { AlertTriangleIcon, Loader2 } from 'lucide-react';
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
  role_name?: string;
  actions: any;
  onFetchRecords: () => void;
}

// WP-832 review blocker — UNDISCLOSED ROLE REPLACEMENT.
//
// `account_organizations.role_id` is SINGLE-VALUED and required, so assigning a
// user to this role does not ADD a role: it REPLACES the one they hold today.
// The grid's `roles` column is not disclosure (it is easy to miss and it is
// dropped from card/mobile view), so the replacement is stated in copy up front
// and then named per user in a confirmation step before anything is written.
// WP-832 QA-FIX — the drawer footer must outrank the grid's pagination bar.
//
// `src/components/platform/Grid/views/GridDesktop.tsx:54` wraps the pagination
// bar in `sticky z-50`. These footers are `absolute` overlays, so with no
// z-index they are `z-index: auto` and LOSE to z-50 regardless of DOM order:
// the "Review & replace" button rendered visible but was not hit-testable at
// any desktop width (0/60 self-hits at 1680x1000, interceptor
// `contact-grd-pagination-page1-btn`; 30/30 at 390x844, where Grid/index.tsx
// branches to GridMobile which has no z-50 wrapper). Hence `z-[60]`.
//
// Raising the z-index alone would only swap which control is unclickable, so
// the grid is also shortened to land its pagination bar ABOVE the footer.
// Measured live at 1680x1000 (production, 2026-08-26):
//   drawer Card bottom            1002  (md:h-[calc(100dvh-37px)] + translate-y-2)
//   footer height                   67  (border-t 1 + py-4 32 + Button h-[34px])
//   footer top                     935  => the band the footer occupies
//   picker grid scroll-port top    239  (root top 83 + warning 44 + gap-4 16
//                                        + grid header 96)
//   pagination block below scroll    64  (8px card gap + 56px measured bar)
// So the scroll port must end by 935 - 64 = 871, i.e. at most 632px tall at a
// 1000px viewport => 100vh - 368px. Rounded to `100vh-24em` (384px) for ~16px
// of clearance. The subtracted term is fixed chrome, so this holds at every
// viewport HEIGHT (verified arithmetic at 900/1000/1080).
// `pb-28` (112px) reserves space past the footer's 99px extent (bottom-8 32 + 67).
//
// ⚠️ Do NOT "fix" this by lowering z-50 in the shared Grid platform: that
// wrapper is used by ~20 grids. See DC000730 §3.1.
const REPLACEMENT_NOTICE =
  'A user can hold only one role. Assigning a user here REPLACES the role they hold today — their current role is revoked.';

const rolesOf = (row: any): string[] => {
  const roles = row?.roles;

  if (Array.isArray(roles)) return roles.filter(Boolean).map(String);
  if (typeof roles === 'string' && roles.trim()) return [roles.trim()];

  return [];
};

const nameOf = (row: any): string =>
  [row?.first_name, row?.middle_name, row?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() ||
  row?.email ||
  row?.code ||
  row?.id;

export default function UserPicker({
  user_role_id,
  role_name,
  actions,
  onFetchRecords,
}: UserPickerProps) {
  const toast = useToast();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
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

  const requestConfirm = useCallback(() => {
    if (selectedRows.length === 0) {
      // @ts-expect-error - No type yet
      toast.warning('Please select at least one user');
      return;
    }

    setIsConfirming(true);
  }, [selectedRows, toast]);

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
      setIsConfirming(false);
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

  const targetRole = role_name?.trim() ? `"${role_name.trim()}"` : 'this role';

  if (isConfirming) {
    return (
      <div
        className="relative flex h-full flex-col gap-4 overflow-y-auto pb-28"
        data-test-id="user-role-rcrd-assign-user-confirm"
      >
        <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              This replaces each user&apos;s current role
            </span>
            <span>{REPLACEMENT_NOTICE}</span>
          </div>
        </div>

        <div className="px-1 text-sm">
          <p className="mb-2">
            {selectedRows.length === 1 ? 'This user' : `These ${selectedRows.length} users`}{' '}
            will be assigned to {targetRole}:
          </p>
          <ul className="flex flex-col gap-1">
            {selectedRows.map((row) => {
              const roles = rolesOf(row);

              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-baseline gap-x-1 rounded border-b px-1 py-1.5 last:border-b-0"
                  data-test-id="user-role-rcrd-assign-user-confirm-row"
                >
                  <span className="font-medium">{nameOf(row)}</span>
                  {roles.length > 0 ? (
                    <span className="text-muted-foreground">
                      — loses{' '}
                      <span className="font-medium text-amber-800">
                        {roles.join(', ')}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      — current role will be replaced
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-[60] flex justify-end gap-2 border-t bg-background px-4 py-4">
          <Button
            disabled={assignMutation.isPending}
            variant="outline"
            onClick={() => setIsConfirming(false)}
          >
            Back
          </Button>
          <Button
            className="flex items-center gap-2"
            data-test-id="user-role-rcrd-assign-user-confirm-btn"
            disabled={assignMutation.isPending}
            onClick={handleSave}
          >
            {assignMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Replace role for {selectedRows.length}{' '}
            {selectedRows.length === 1 ? 'user' : 'users'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col gap-4 pb-28">
      <div
        className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        data-test-id="user-role-rcrd-assign-user-warning"
      >
        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{REPLACEMENT_NOTICE}</span>
      </div>

      <Grid
        {...gridProps}
        data={items}
        gridChildClass="!h-[calc(100vh-24em)]"
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
          defaultShownColumns: ['first_name', 'last_name', 'email', 'roles'],
          customTabDefaults: { defaultSorting },
          onFetchRecords: fetchData,
        }}
      />

      <div className="absolute inset-x-0 bottom-8 z-[60] flex justify-end gap-2 border-t bg-background px-4 py-4">
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
          onClick={requestConfirm}
        >
          {assignMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Review &amp; replace ({selectedRows.length} selected)
        </Button>
      </div>
    </div>
  );
}
