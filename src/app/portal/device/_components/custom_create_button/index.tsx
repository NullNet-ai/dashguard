'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { createDraftDevice } from '../actions/createDeviceDraft';
import { useToast } from '~/context/ToastProvider';

const CustomCreateButton = ({ entity }: { entity: string }) => {
  const toast = useToast();

  const handleCreate = async () => {
    try {
      await createDraftDevice({ entity });
    } catch (error: any) {
      console.error('Failed to create draft record:', error);
      if (error.message === 'Device Role not found') {
        toast.error(
          'Device Role not found. Please create a device role first.',
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-end">
      <Button iconPlacement={'left'} Icon={PlusIcon} onClick={handleCreate}>
        New
      </Button>
    </div>
  );
};

export default CustomCreateButton;
