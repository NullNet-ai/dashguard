'use client';

import { Button } from '~/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import DevicePicker from './DevicePicker';

interface AssignDeviceDrawerButtonProps {
  contact_id: string;
  onFetchRecords: () => void;
}

export default function AssignDeviceDrawerButton({
  contact_id,
  onFetchRecords,
}: AssignDeviceDrawerButtonProps) {
  const { actions } = useSideDrawer();

  const handleOpenDrawer = () => {
    const config = {
      title: 'Assign Devices',
      sideDrawerWidth: '1200px',
      sideDrawerHeight: '50%',
      enableHistory: true,
      body: {
        component: () => (
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
  };

  return (
    <Button onClick={handleOpenDrawer}>
      Assign <PlusIcon className="ml-2 h-4 w-4" />
    </Button>
  );
}
