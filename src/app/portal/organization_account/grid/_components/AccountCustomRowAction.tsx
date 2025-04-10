'use client';

import { Button } from '@headlessui/react';
import {
  Ban,
  X,
  LockKeyholeOpen,
  RotateCcw,
  Send,
  LockKeyhole,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { DropdownMenuItem } from '~/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '~/components/ui/tooltip';
import { useSocket } from '~/context/SocketProvider';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';

interface AccountCustomRowActionProps {
  row: {
    original: {
      id: string;
      code: string;
      account_status: string;
      categories: string[]; // Added category for logic (External/Internal User)
      account_id: string;
    };
  };
  viewMode?: 'table' | 'card';
  config?: Record<string, any>;
}

const ACTIONS = [
  {
    condition: (status: string, category: string) =>
      status === 'Active' && category === 'External User',
    action: 'Access Disabled',
    icon: LockKeyhole,
    color: 'text-yellow-500',
    tooltip: 'Disable Access',
  },
  {
    condition: (status: string, category: string) =>
      status === 'Active' && category === 'Internal User',
    action: 'Deactivated',
    icon: Ban,
    color: 'text-destructive',
    tooltip: 'Deactivate Account',
  },
  {
    condition: (status: string) => status === 'Access Disabled',
    action: 'Active',
    icon: LockKeyholeOpen,
    color: 'text-yellow-500',
    tooltip: 'Enable Access',
  },
  {
    condition: (status: string) => status === 'Deactivated',
    action: 'Active',
    icon: RotateCcw,
    color: 'text-green-600',
    tooltip: 'Activate Account',
  },
  {
    condition: (status: string) => status === 'Invited',
    action: 'Invitation Canceled',
    icon: X,
    color: 'text-destructive',
    tooltip: 'Cancel Invitation',
  },
];

export function AccountCustomRowAction({
  row,
  viewMode,
  config,
}: AccountCustomRowActionProps) {
  const toast = useToast();
  const pathName = usePathname();
  const router = useRouter();

  const {
    code,
    account_status,
    categories = [],
    id,
    account_id,
  } = row?.original ?? {};

  const socketClient = useSocket()

  const updateRecordStatus = api.record.updateRecordStatus.useMutation();
  const resendInvite = api.account.createInvitationRecord.useMutation();
  const archiveAccountInvitation =
    api.account.archiveAccountInvitation.useMutation();

  const handleChangeStatus = async (record_status: string) => {
    try {
      await updateRecordStatus.mutateAsync({
        id: code,
        record_status,
        entity: 'organization_account',
        field_key: 'account_status',
      });
      if (record_status === 'Invitation Canceled') {
        await archiveAccountInvitation.mutateAsync({
          id,
        });
      }
      pathName && router.push(`${pathName}?${code}=${record_status}`);
    } catch {
      toast.error('Failed to update account status');
    }
  };

  const handleResendInvite = async () => {
    try {
     const response =  await resendInvite.mutateAsync({
        account_code: code,
        manual_trigger: true,
      });
      socketClient.publish({
        type: 'ACCOUNT_INVITE',
        payload: response
      })
      pathName && router.push(pathName);
    } catch {
      toast.error('Failed to resend invitation');
    }
  };

  if (viewMode === 'card') {
    const renderDropdownItem = (
      icon: JSX.Element,
      label: string,
      onClick: () => void,
      color: string,
    ) => (
      <DropdownMenuItem
        key={label}
        className={`relative flex cursor-pointer items-center gap-2 ${color}`}
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
      </DropdownMenuItem>
    );

    return [
      ...ACTIONS.filter(({ condition }) =>
        condition(account_status, categories[0] ?? ''),
      ).map(({ action, icon: Icon, color, tooltip }) =>
        renderDropdownItem(
          <Icon className="h-3 w-3" />,
          tooltip,
          () => handleChangeStatus(action),
          color,
        ),
      ),
      [
        'Invited',
        'Invitation Canceled',
        'Invitation Expired',
        'Pending Setup',
      ].some((status) => status === account_status) &&
        renderDropdownItem(
          <Send className="h-3 w-3 text-yellow-500" />,
          'Re-send Invite',
          handleResendInvite,
          'text-yellow-500',
        ),
    ].filter(Boolean); // Removes false/null items
  }

  const isDisable =
    config?.additionalData?.accountEmail?.toLowerCase() ===
    account_id?.toLowerCase();

  return (
    <TooltipProvider delayDuration={0}>
      {ACTIONS.filter(({ condition }) =>
        condition(account_status, categories[0] ?? ''),
      ).map(({ action, icon: Icon, color, tooltip }) => (
        <Tooltip key={action}>
          <TooltipTrigger asChild>
            <Button
              onClick={() => handleChangeStatus(action)}
              disabled={isDisable}
              className={isDisable ? 'disabled:opacity-50' : ''}
            >
              <Icon className={`h-3 w-3 ${color}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent  align='center' side='left' sideOffset={15} className="z-[9999]">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      {[
        'Invited',
        'Invitation Canceled',
        'Invitation Expired',
        'Pending Setup',
      ].includes(account_status) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleResendInvite}>
              <Send className="h-3 w-3 text-yellow-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent  align='center' side='left' sideOffset={15} className="z-[9999]">
            <p>Re-send Invite</p>
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipProvider>
  );
}
