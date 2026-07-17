'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '~/components/ui/popover';
import DevicePicker from './DevicePicker';
import DeviceGroupPicker from './DeviceGroupPicker';

interface AssignDeviceDrawerButtonProps {
  contact_id: string;
  onFetchRecords: () => void;
}

export default function AssignDeviceDrawerButton({
  contact_id,
  onFetchRecords,
}: AssignDeviceDrawerButtonProps) {
  const { actions } = useSideDrawer();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const openDrawer = (mode: 'device' | 'group') => {
    const isGroup = mode === 'group';
    const config = {
      title: isGroup ? 'Assign Device Groups' : 'Assign Devices',
      sideDrawerWidth: '1200px',
      sideDrawerHeight: '50%',
      enableHistory: true,
      body: {
        component: () =>
          isGroup ? (
            <DeviceGroupPicker
              contact_id={contact_id}
              actions={actions}
              onFetchRecords={onFetchRecords}
            />
          ) : (
            <DevicePicker
              contact_id={contact_id}
              actions={actions}
              onFetchRecords={onFetchRecords}
            />
          ),
        componentProps: {},
      },
      resizable: true,
      showResizeHandle: true,
      onCloseSideDrawer() {
        onFetchRecords();
      },
    };

    actions.openSideDrawer(config as any);
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button>
          Assign <PlusIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => openDrawer('device')}
          >
            By Device
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => openDrawer('group')}
          >
            By Device Group
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
