'use client';

import { EOperator } from '@dna-platform/common-orm';
import { Loader2, Users } from 'lucide-react';
import { useContext, useState } from 'react';

import { GridContext } from '~/components/platform/Grid/Provider';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '~/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';

import { partitionDevicesForGroup } from '../_utils/assign-device-group';

// WP-830: this lives in the grid's customCreateButton slot (rendered inside
// GridProvider) instead of the shared bulk-action button, because that button
// always opens the shared confirm dialog and handleCustomBulkAction never
// closes it — see Grid/Provider.tsx handleCustomBulkAction.
export default function AssignDeviceGroupButton({
  onAssigned,
}: {
  onAssigned: () => void;
}) {
  const { state } = useContext(GridContext);
  const table = state?.table;
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState('');

  const assignDevices = api.deviceGroup.assignDevices.useMutation();
  const { data: groupData, isLoading: isLoadingGroups } =
    api.deviceGroup.mainGrid.useQuery(
      {
        entity: 'device_group_settings',
        pluck: ['id', 'name', 'status'],
        limit: 500,
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
      { enabled: open },
    );

  const groups = (groupData?.items ?? []) as Record<string, any>[];
  const selectedRows = table?.getSelectedRowModel().rows ?? [];

  if (!selectedRows.length) return null;

  const handleAssign = async () => {
    const group = groups.find((item) => item?.id === groupId);
    if (!group?.id || !group?.name) return;

    const { device_ids, skipped } = partitionDevicesForGroup(
      selectedRows.map((row) => row?.original),
      group.name as string,
    );

    if (!device_ids.length) {
      toast.error(
        `All ${skipped} selected device${skipped > 1 ? 's are' : ' is'} already in "${group.name}"`,
      );
      return;
    }

    try {
      await assignDevices.mutateAsync({
        device_group_setting_id: group.id as string,
        device_ids,
      });
      toast.success(
        `Assigned ${device_ids.length} device${device_ids.length > 1 ? 's' : ''} to "${group.name}"` +
          (skipped ? ` (${skipped} already assigned)` : ''),
      );
      setOpen(false);
      setGroupId('');
      table?.resetRowSelection();
      onAssigned();
    } catch (error) {
      console.error('[WP-830] assign device group failed', error);
      toast.error('Failed to assign device group');
    }
  };

  return (
    <>
      <Button
        Icon={Users}
        className="flex lg:inline-flex"
        data-test-id="device-grd-assign-device-group-btn"
        iconClassName="size-4"
        iconPlacement="left"
        onClick={() => setOpen(true)}
      >
        Assign Device Group
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-5/6 bg-white md:w-3/6">
          <div className="flex flex-1 gap-2 py-4 font-bold">
            Assign Device Group
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm">
              {selectedRows.length} device
              {selectedRows.length > 1 ? 's' : ''} selected.
            </span>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger data-test-id="device-grd-assign-device-group-select">
                <SelectValue
                  placeholder={
                    isLoadingGroups ? 'Loading...' : 'Select a device group'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id as string}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator className="my-2" />
          <DialogFooter className="py-2">
            <Button
              className="mr-2"
              color="primary"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="mr-2 flex items-center gap-2"
              disabled={!groupId || assignDevices.isPending}
              onClick={handleAssign}
            >
              {assignDevices.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
