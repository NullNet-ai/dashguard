'use client';

import { MonitorCheck } from 'lucide-react';
import React from 'react';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import AuthorizaDeviceForm from './AuthorizeDeviceForm';

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

export default function AuthorizeDeviceAction(
  props: AuthorizeDeviceActionProps,
) {
  const {
    actions: { openSideDrawer },
  } = useSideDrawer();

  const disabled = React.useMemo(
    () =>
      props.row.original.is_device_authorized ||
      !props.row.original.is_device_online,
    [props.row],
  );

  const handleOpenSideDrawer = React.useCallback(() => {
    openSideDrawer({
      header: <h1>Authorize device {props.row.original.code}</h1>,
      sideDrawerWidth: '500px',
      body: {
        component: () => (
          <div>
            <AuthorizaDeviceForm code={props.row.original.code} />
          </div>
        ),
        componentProps: {},
      },
    });
  }, [openSideDrawer, props.row.original.code]);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button
            disabled={disabled}
            variant="ghost"
            onClick={() => handleOpenSideDrawer()}
          >
            <MonitorCheck className="h-4 w-4 text-success" />
          </Button>
          <TooltipContent side="top">
            <div className="text-sm">
              <span className="text-justify">{'Authorize Device'}</span>
            </div>
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
}
