import { headers } from 'next/headers';
import { api } from '~/trpc/server';
import { DeviceGroupDetailsClient } from './client';

export default async function DeviceGroupDetails() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , , identifier] = pathname.split('/');

  const record_details = await api.record.getByCode({
    main_entity: 'device',
    id: identifier!,
    pluck_fields: ['id'],
  });
  const device_id = record_details?.data?.id as string;

  const assignableGroups = await api.deviceGroup.assignableGroupsForDevice({
    device_id,
  });

  const assignedGroups = await api.deviceGroup.assignedGroupsForDevice({
    device_id,
  });

  const multiSelectOptions = [
    ...assignableGroups.map((g: any) => ({
      label: g.name,
      value: g.id,
    })),
    ...assignedGroups.map((g: any) => ({
      label: g.name,
      value: g.device_group_setting_id,
    })),
  ];

  const selectedGroupIds = assignedGroups.map(
    (g: any) => g.device_group_setting_id,
  );

  return (
    <DeviceGroupDetailsClient
      deviceId={device_id || ''}
      multiSelectOptions={multiSelectOptions}
      selectedGroupIds={selectedGroupIds}
    />
  );
}
