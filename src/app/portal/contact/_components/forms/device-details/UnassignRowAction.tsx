'use client';

import { Unlink2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';

export default function UnassignRowAction({
  row,
  onFetchRecords,
}: {
  row: any;
  onFetchRecords: () => void;
}) {
  const toast = useToast();
  const unassignMutation = api.contactDevice.unassign.useMutation();
  const device_contact_id = row.original?.id;

  const handleUnassign = async () => {
    try {
      await unassignMutation.mutateAsync({
        device_contact_ids: [device_contact_id],
      });
      toast.success('Device unassigned successfully');
      onFetchRecords();
    } catch (err) {
      console.error('Unassign failed:', err);
      toast.error('Failed to unassign device');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnassign}
            disabled={unassignMutation.isPending}
          >
            <Unlink2 className="h-4 w-4 text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <div className="text-sm">Unassign</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
