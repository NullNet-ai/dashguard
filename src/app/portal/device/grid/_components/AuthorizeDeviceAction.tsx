'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';

import { openRemoteAccessSession } from '../../_components/openRemoteAccessSession';

interface AuthorizeDeviceActionProps {
  row: {
    original: {
      id: string;
      code: string;
      is_device_online: boolean;
      is_device_authorized: boolean;
    };
  };
  viewMode?: 'table' | 'card';
  config?: Record<string, any>;
}

const TYPE_LABELS: Record<string, string> = {
  ssh: 'SSH',
  tty: 'TTY',
  ui: 'UI',
  rd: 'RD',
};

const TYPE_ORDER = ['ssh', 'tty', 'ui', 'rd'];

export default function AuthorizeDeviceAction(
  props: AuthorizeDeviceActionProps,
) {
  const {
    row: {
      original: { id, is_device_online, is_device_authorized },
    },
  } = props;
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [connectingKey, setConnectingKey] = React.useState<string | null>(null);

  const disabled = React.useMemo(
    () => !is_device_authorized || !is_device_online,
    [is_device_authorized, is_device_online],
  );

  const { data: deviceServices, isLoading } =
    api.deviceRemoteAccessSession.fetchDeviceServices.useQuery(
      { device_id: id, limit: 100 },
      { enabled: open },
    );

  const createUpdate =
    api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation();

  const groupedServices = React.useMemo(() => {
    const services: any[] = Array.isArray(deviceServices) ? deviceServices : [];
    const groups: Record<string, any[]> = {
      ssh: [],
      tty: [],
      ui: [],
      rd: [],
    };
    for (const service of services) {
      const protocol = (service as any)?.item?.protocol;
      if (protocol === 'ssh') groups.ssh?.push(service);
      else if (protocol === 'tty') groups.tty?.push(service);
      else if (protocol === 'http' || protocol === 'https')
        groups.ui?.push(service);
      else if (protocol === 'rd') groups.rd?.push(service);
    }
    return groups;
  }, [deviceServices]);

  const availableTypes = TYPE_ORDER.filter(
    (type) => (groupedServices[type]?.length ?? 0) > 0,
  );

  const handleConnect = React.useCallback(
    async (remote_access_type: string, service: any, key: string) => {
      setConnectingKey(key);
      try {
        const res = await createUpdate.mutateAsync({
          id: '',
          device_id: id,
          remote_access_type,
          category: remote_access_type,
          device_service_id: service.value,
        });

        if (res?.success && res) {
          const { remote_access_session } = res?.data[0] as Record<string, any>;
          openRemoteAccessSession({
            remote_access_type,
            remote_access_session,
            device_id: id,
          });
        } else {
          toast.error('Failed to start Remote Access: Invalid response');
        }
      } catch (error: any) {
        toast.error(
          `Failed to start Remote Access: ${error.message || 'Unknown error'}`,
        );
      } finally {
        setConnectingKey(null);
        setOpen(false);
      }
    },
    [createUpdate, id, toast],
  );

  if (!is_device_online) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          data-test-id="device-remote-access-button"
          disabled={disabled}
          title={open ? undefined : 'Remote Access'}
          variant="ghost"
          className="focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <span
            aria-hidden
            className="inline-block h-4 w-4 bg-current text-success [mask-image:url('/remote_access.png')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isLoading && <DropdownMenuItem disabled>Loading…</DropdownMenuItem>}
        {!isLoading && availableTypes.length === 0 && (
          <DropdownMenuItem disabled>No connections available</DropdownMenuItem>
        )}
        {availableTypes.map((type) => {
          const services = groupedServices[type] ?? [];
          if (type === 'ui' && services.length > 1) {
            return (
              <DropdownMenuSub key={type}>
                <DropdownMenuSubTrigger>
                  {TYPE_LABELS[type]}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {services.map((service: any) => (
                    <DropdownMenuItem
                      key={service.value}
                      disabled={connectingKey !== null}
                      onSelect={(e) => {
                        e.preventDefault();
                        handleConnect(type, service, service.value);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {service.label}
                        {connectingKey === service.value && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          }

          const service = services[0];
          if (!service) return null;

          return (
            <DropdownMenuItem
              key={type}
              disabled={connectingKey !== null}
              onSelect={(e) => {
                e.preventDefault();
                handleConnect(type, service, type);
              }}
            >
              <span className="flex items-center gap-2">
                {TYPE_LABELS[type]}
                {connectingKey === type && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
