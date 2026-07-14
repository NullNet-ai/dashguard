'use client'

import { useMemo } from 'react';
import Image from 'next/image'


import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import { openRemoteAccessSession } from '~/app/portal/device_remote_access_session/_utils/startRemoteAccessSession';

type RemoteAccessActionButtonProps = {
  identifier: string
  main_entity: string
}

const RemoteAccessActionButton = ({
  identifier,
  main_entity,
}: RemoteAccessActionButtonProps) => {
  const toast = useToast();
  const createUpdate =
    api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation();

  const { data: devices } = api.deviceRemoteAccessSession.fetchDevices.useQuery(
    {
      limit: 1,
      device_code: identifier,
    },
  );

  const effectiveDeviceId = devices?.[0]?.value;

  const { data: deviceServices } =
    api.deviceRemoteAccessSession.fetchDeviceServices.useQuery(
      {
        limit: 100,
        device_code: identifier,
        device_id: effectiveDeviceId,
      },
      {
        enabled: !!effectiveDeviceId,
      },
    );

  const availableRemoteAccessTypes = useMemo(() => {
    const services = Array.isArray(deviceServices) ? deviceServices : [];
    const types = new Set<string>();
    for (const s of services) {
      const proto = (s as any).item?.protocol;
      if (proto === 'ssh') types.add('ssh');
      else if (proto === 'tty') types.add('tty');
      else if (proto === 'http' || proto === 'https') types.add('ui');
      else if (proto === 'rd') types.add('rd');
    }
    return types;
  }, [deviceServices]);

  const typeOptions = [
    { label: 'SSH', value: 'ssh' },
    { label: 'TTY', value: 'tty' },
    { label: 'UI', value: 'ui' },
    { label: 'RD', value: 'rd' },
  ].filter((opt) => availableRemoteAccessTypes.has(opt.value));

  const handleStartSession = async (remoteAccessType: string) => {
    if (!effectiveDeviceId) {
      toast.error('Device not found');
      return;
    }

    const filteredServices = Array.isArray(deviceServices)
      ? deviceServices.filter((s: any) => {
          const proto = s.item?.protocol;
          if (remoteAccessType === 'ssh') return proto === 'ssh';
          if (remoteAccessType === 'tty') return proto === 'tty';
          if (remoteAccessType === 'ui')
            return proto === 'http' || proto === 'https';
          if (remoteAccessType === 'rd') return proto === 'rd';
          return false;
        })
      : [];

    if (filteredServices.length === 0) {
      toast.error('No service found for this connection type');
      return;
    }

    const deviceServiceId = filteredServices[0]?.value;

    try {
      const res = await createUpdate.mutateAsync({
        id: '',
        device_id: effectiveDeviceId,
        remote_access_type: remoteAccessType,
        category: remoteAccessType,
        device_service_id: deviceServiceId,
      });

      if (res?.success && res?.data?.[0]) {
        const { remote_access_session } = res.data[0] as Record<string, any>;
        toast.success('Remote access session started');
        openRemoteAccessSession(
          remote_access_session,
          remoteAccessType,
          effectiveDeviceId,
        );
      } else {
        toast.error('Failed to start remote access session');
      }
    } catch (error: any) {
      console.error('Remote Access Error:', error);
      toast.error(
        `Failed to start remote access: ${error.message || 'Unknown error'}`,
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="mr-2 gap-2 px-4 text-sm">
          <Image
            src="/remote_access.png"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 brightness-0 invert"
          />
          Remote Access
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {typeOptions.length > 0 ? (
          typeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStartSession(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            No connection types available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default RemoteAccessActionButton
